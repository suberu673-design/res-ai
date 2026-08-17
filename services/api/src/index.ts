import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import {
  ApprovalStatus,
  Environment,
  HealthStatus,
  MarketTimeframe,
  RiskDecisionStatus,
  TradeProposalStatus,
  TradingMode,
  VersionInfo,
  buildTradingContext,
  getTradingModeConfiguration,
  isValidRiskDecisionTransition,
  isValidTradeProposalTransition,
  normalizeTradingMode,
  type AIAnalysisContext,
  type MarketState,
} from '@forex-platform/types';
import {
  createMarketDataProvider,
  MarketDataService,
} from '@forex-platform/market-data';
import { MarketIntelligenceService } from '@forex-platform/market-intelligence';
import {
  buildOpportunityFromMarketState,
  scanOpportunitySet,
} from '@forex-platform/opportunity-engine';
import { AIAnalystService } from '@forex-platform/ai-analyst';
import { z } from 'zod';

const app: Express = express();
const prisma = new PrismaClient({
  log: ['error'],
});

app.use(cors());
app.use(express.json());

const PORT = Number(process.env.API_PORT || 3001);
const HOST = process.env.API_HOST || '0.0.0.0';
const API_VERSION = '0.1.0';
const APP_ENV = (process.env.APP_ENV || 'development') as Environment;
const providerMode = (
  process.env.MARKET_DATA_MODE ||
  process.env.MARKET_DATA_PROVIDER ||
  'mock'
).toUpperCase();
const marketDataService = new MarketDataService({
  provider: createMarketDataProvider(
    providerMode === 'LIVE' ? 'LIVE' : 'MOCK',
    process.env.MARKET_DATA_API_KEY
  ),
  defaultTimeframe: MarketTimeframe.FIFTEEN_MINUTES,
});
const marketIntelligenceService = new MarketIntelligenceService();
const aiAnalystService = new AIAnalystService();

type CandleWrite = {
  symbol: string;
  timeframe: string;
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  source: string;
  volume?: number | null;
};

async function persistCandles(candles: CandleWrite[]) {
  if (!candles.length) return;

  for (const candle of candles) {
    await prisma.marketCandle.upsert({
      where: {
        symbol_timeframe_timestamp: {
          symbol: candle.symbol,
          timeframe: candle.timeframe,
          timestamp: candle.timestamp,
        },
      },
      update: {
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume ?? null,
        source: candle.source,
      },
      create: {
        symbol: candle.symbol,
        timeframe: candle.timeframe,
        timestamp: candle.timestamp,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume ?? null,
        source: candle.source,
      },
    });
  }
}

const symbolParamSchema = z.string().trim().min(1);
const idParamSchema = z.string().trim().min(1);
const timeframeSchema = z.enum(['1m', '5m', '15m', '30m', '1h', '4h', '1d']);
const contextTimeframeSchema = z.enum([
  '1m',
  '5m',
  '15m',
  '30m',
  '1h',
  '4h',
  '1d',
  '1w',
]);
const limitSchema = z.coerce.number().int().min(1).max(500).default(200);
const tradeProposalStatusSchema = z.enum([
  TradeProposalStatus.DRAFT,
  TradeProposalStatus.ANALYZED,
  TradeProposalStatus.RISK_PENDING,
  TradeProposalStatus.APPROVED,
  TradeProposalStatus.REJECTED,
  TradeProposalStatus.EXPIRED,
]);
const riskDecisionStatusSchema = z.enum([
  RiskDecisionStatus.PENDING,
  RiskDecisionStatus.PASS,
  RiskDecisionStatus.FAIL,
  RiskDecisionStatus.OVERRIDE_REQUIRED,
  RiskDecisionStatus.BLOCKED,
]);
const tradingModeSchema = z.string().transform((value) => {
  const mode = normalizeTradingMode(value);
  if (!mode) {
    throw new Error('INVALID_TRADING_MODE');
  }
  return mode;
});

async function persistAIAnalysisHistory(analysis: {
  id: string;
  symbol: string;
  tradingMode: string;
  timeframe: string;
  direction: string;
  assessment: string;
  confidence: number;
  summary: string;
  reasons: string[];
  risks: string[];
  invalidationConditions: string[];
  model: string;
  provider: string;
  marketDataMode: 'LIVE' | 'MOCK';
  opportunityScore: number | null;
  analyzedAt: Date;
}) {
  return prisma.aiAnalysisHistory.create({
    data: {
      id: analysis.id,
      symbol: analysis.symbol,
      tradingMode: analysis.tradingMode,
      timeframe: analysis.timeframe,
      direction: analysis.direction,
      assessment: analysis.assessment,
      confidence: analysis.confidence,
      summary: analysis.summary,
      reasons: analysis.reasons,
      risks: analysis.risks,
      invalidationConditions: analysis.invalidationConditions,
      provider: analysis.provider,
      model: analysis.model,
      marketDataMode: analysis.marketDataMode,
      sourceContext: {
        opportunityScore: analysis.opportunityScore,
        analyzedAt: analysis.analyzedAt.toISOString(),
      },
      analyzedAt: analysis.analyzedAt,
    },
  });
}

async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  latency?: number;
}> {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      latency: Date.now() - startTime,
    };
  } catch (error) {
    return { connected: false };
  }
}

app.get('/health', async (req: Request, res: Response) => {
  const database = await checkDatabaseHealth();
  const health: HealthStatus = {
    status: database.connected ? 'healthy' : 'degraded',
    timestamp: new Date(),
    database: {
      status: database.connected ? 'connected' : 'disconnected',
      ...(database.latency !== undefined ? { latency: database.latency } : {}),
    },
  };

  if (!database.connected) {
    return res.status(503).json(health);
  }

  return res.json(health);
});

app.get('/api/version', (req: Request, res: Response) => {
  const version: VersionInfo = {
    version: API_VERSION,
    environment: APP_ENV,
    timestamp: new Date(),
  };

  res.json(version);
});

app.get('/api/market/status', async (req: Request, res: Response) => {
  const status = {
    provider: marketDataService.getProviderName(),
    mode: marketDataService.getProviderMode(),
    connected: true,
    lastSuccessfulUpdate: new Date(),
  };

  res.json(status);
});

app.get('/api/market/pairs', async (req: Request, res: Response) => {
  const pairs = await marketDataService.getSupportedPairs();
  res.json({
    provider: marketDataService.getProviderName(),
    mode: marketDataService.getProviderMode(),
    count: pairs.length,
    pairs,
  });
});

app.get('/api/market/quote/:symbol', async (req: Request, res: Response) => {
  try {
    const symbol = symbolParamSchema.parse(req.params.symbol);
    const quote = await marketDataService.getQuote(symbol);
    res.json(quote);
  } catch (error) {
    res.status(400).json({
      error: {
        code: 'INVALID_SYMBOL',
        message: 'A valid FX symbol is required.',
      },
      timestamp: new Date(),
    });
  }
});

app.get('/api/market/candles/:symbol', async (req: Request, res: Response) => {
  try {
    const symbol = symbolParamSchema.parse(req.params.symbol);
    const timeframe = timeframeSchema.parse(req.query.timeframe ?? '15m');
    const limit = limitSchema.parse(req.query.limit ?? 200);
    const timeframeEnum = timeframe as MarketTimeframe;

    const candles = await marketDataService.getHistoricalCandles(
      symbol,
      timeframeEnum,
      limit
    );
    try {
      const writes: CandleWrite[] = candles.map((candle) => ({
        symbol: candle.symbol,
        timeframe: candle.timeframe,
        timestamp: candle.timestamp,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        source: candle.source,
        volume: candle.volume ?? null,
      }));

      await persistCandles(writes);
    } catch (error) {
      console.warn('Failed to persist market candles:', error);
    }

    res.json({
      symbol: marketDataService.normalizeSymbolForDisplay(symbol),
      timeframe,
      count: candles.length,
      candles,
    });
  } catch (error) {
    res.status(400).json({
      error: {
        code: 'INVALID_REQUEST',
        message: 'Symbol, timeframe, and limit parameters are invalid.',
      },
      timestamp: new Date(),
    });
  }
});

app.get('/api/analysis/:symbol', async (req: Request, res: Response) => {
  try {
    const symbol = symbolParamSchema.parse(req.params.symbol);
    const timeframe = timeframeSchema.parse(req.query.timeframe ?? '1h');
    const limit = limitSchema.parse(req.query.limit ?? 220);
    const timeframeEnum = timeframe as MarketTimeframe;

    const candles = await marketDataService.getHistoricalCandles(
      symbol,
      timeframeEnum,
      limit
    );
    const analysis = marketIntelligenceService.analyzePair({
      symbol,
      timeframe: timeframeEnum,
      candles,
      source: marketDataService.getProviderName(),
      dataStatus: candles.length >= 50 ? 'ok' : 'insufficient_data',
      quote: candles.at(-1)?.close ?? null,
    });

    const payload: MarketState & {
      sourceMode: 'LIVE' | 'MOCK';
      dataStatus: string;
      timestamp: Date;
    } = {
      ...analysis,
      sourceMode: marketDataService.getProviderMode(),
      source: marketDataService.getProviderName(),
      dataStatus: analysis.dataStatus ?? 'ok',
      timestamp: new Date(),
    };

    res.json(payload);
  } catch (error) {
    res.status(400).json({
      error: {
        code: 'INVALID_ANALYSIS_REQUEST',
        message: 'Symbol, timeframe, and history requirements are invalid.',
      },
      timestamp: new Date(),
    });
  }
});

app.get('/api/trading-modes', (req: Request, res: Response) => {
  const modes = Object.values(TradingMode).map((mode) => ({
    mode,
    ...getTradingModeConfiguration(mode),
  }));

  res.json({
    count: modes.length,
    modes,
  });
});

app.get('/api/trading-modes/:mode', (req: Request, res: Response) => {
  try {
    const mode = tradingModeSchema.parse(req.params.mode);
    res.json({
      mode,
      ...getTradingModeConfiguration(mode),
    });
  } catch (error) {
    res.status(400).json({
      error: {
        code: 'INVALID_TRADING_MODE',
        message: 'The requested trading mode is not recognized.',
      },
      timestamp: new Date(),
    });
  }
});

app.get('/api/trading-context/:symbol', async (req: Request, res: Response) => {
  try {
    const symbol = symbolParamSchema.parse(req.params.symbol);
    const mode = tradingModeSchema.parse(req.query.mode ?? TradingMode.SWING);
    const timeframe = contextTimeframeSchema.parse(req.query.timeframe ?? '4h');
    const timeframeEnum = timeframe as MarketTimeframe;

    let marketState: Partial<MarketState> | null = null;
    try {
      const candles = await marketDataService.getHistoricalCandles(
        symbol,
        timeframeEnum,
        220
      );
      const analysis = marketIntelligenceService.analyzePair({
        symbol,
        timeframe: timeframeEnum,
        candles,
        source: marketDataService.getProviderName(),
        dataStatus: candles.length >= 50 ? 'ok' : 'insufficient_data',
        quote: candles.at(-1)?.close ?? null,
      });
      marketState = analysis;
    } catch (error) {
      marketState = null;
    }

    const context = buildTradingContext({
      symbol,
      mode,
      timeframe,
      marketState,
    });

    res.json(context);
  } catch (error) {
    res.status(400).json({
      error: {
        code: 'INVALID_TRADING_CONTEXT_REQUEST',
        message: 'Symbol, mode, and timeframe inputs are invalid.',
      },
      timestamp: new Date(),
    });
  }
});

app.get('/api/opportunities', async (req: Request, res: Response) => {
  try {
    const mode = tradingModeSchema.parse(req.query.mode ?? TradingMode.SWING);
    const timeframe = contextTimeframeSchema.parse(req.query.timeframe ?? '4h');
    const limit = z.coerce
      .number()
      .int()
      .min(1)
      .max(10)
      .default(5)
      .parse(req.query.limit ?? 5);
    const timeframeEnum = timeframe as MarketTimeframe;
    const symbols = [
      'EURUSD',
      'GBPUSD',
      'USDJPY',
      'AUDUSD',
      'EURGBP',
      'GBPJPY',
      'NZDUSD',
    ];

    const opportunities = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const candles = await marketDataService.getHistoricalCandles(
            symbol,
            timeframeEnum,
            220
          );
          const analysis = marketIntelligenceService.analyzePair({
            symbol,
            timeframe: timeframeEnum,
            candles,
            source: marketDataService.getProviderName(),
            dataStatus: candles.length >= 50 ? 'ok' : 'insufficient_data',
            quote: candles.at(-1)?.close ?? null,
          });

          return {
            symbol,
            state: analysis,
            mode,
          };
        } catch (error) {
          return { symbol, state: null, mode };
        }
      })
    );

    const ranked = scanOpportunitySet(opportunities, {
      minimumScore: 55,
      minimumConfidence: 45,
      requireValidData: true,
      minTrendStrength: 1,
    }).slice(0, limit);

    res.json({
      mode,
      timeframe,
      count: ranked.length,
      opportunities: ranked,
    });
  } catch (error) {
    res.status(400).json({
      error: {
        code: 'INVALID_OPPORTUNITY_REQUEST',
        message: 'Mode, timeframe, and opportunity filters are invalid.',
      },
      timestamp: new Date(),
    });
  }
});

app.get('/api/opportunities/:symbol', async (req: Request, res: Response) => {
  try {
    const symbol = symbolParamSchema.parse(req.params.symbol);
    const mode = tradingModeSchema.parse(req.query.mode ?? TradingMode.SWING);
    const timeframe = contextTimeframeSchema.parse(req.query.timeframe ?? '4h');
    const timeframeEnum = timeframe as MarketTimeframe;

    const candles = await marketDataService.getHistoricalCandles(
      symbol,
      timeframeEnum,
      220
    );
    const analysis = marketIntelligenceService.analyzePair({
      symbol,
      timeframe: timeframeEnum,
      candles,
      source: marketDataService.getProviderName(),
      dataStatus: candles.length >= 50 ? 'ok' : 'insufficient_data',
      quote: candles.at(-1)?.close ?? null,
    });

    const opportunity = buildOpportunityFromMarketState(analysis, mode);
    res.json({
      symbol,
      timeframe,
      mode,
      opportunity,
    });
  } catch (error) {
    res.status(400).json({
      error: {
        code: 'INVALID_SYMBOL_OPPORTUNITY',
        message:
          'The requested symbol could not be analyzed for opportunities.',
      },
      timestamp: new Date(),
    });
  }
});

app.get('/api/scanner', async (req: Request, res: Response) => {
  try {
    const mode = tradingModeSchema.parse(req.query.mode ?? TradingMode.SWING);
    const timeframe = contextTimeframeSchema.parse(req.query.timeframe ?? '4h');
    const limit = z.coerce
      .number()
      .int()
      .min(1)
      .max(10)
      .default(5)
      .parse(req.query.limit ?? 5);
    const timeframeEnum = timeframe as MarketTimeframe;
    const symbols = [
      'EURUSD',
      'GBPUSD',
      'USDJPY',
      'AUDUSD',
      'EURGBP',
      'GBPJPY',
    ];

    const candidates = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const candles = await marketDataService.getHistoricalCandles(
            symbol,
            timeframeEnum,
            220
          );
          const analysis = marketIntelligenceService.analyzePair({
            symbol,
            timeframe: timeframeEnum,
            candles,
            source: marketDataService.getProviderName(),
            dataStatus: candles.length >= 50 ? 'ok' : 'insufficient_data',
            quote: candles.at(-1)?.close ?? null,
          });
          return {
            symbol,
            state: analysis,
            mode,
          };
        } catch (error) {
          return { symbol, state: null, mode };
        }
      })
    );

    const opportunities = scanOpportunitySet(candidates, {
      minimumScore: 60,
      minimumConfidence: 50,
      requireValidData: true,
      minTrendStrength: 1,
    }).slice(0, limit);

    res.json({
      mode,
      timeframe,
      count: opportunities.length,
      opportunities,
      generatedAt: new Date(),
    });
  } catch (error) {
    res.status(400).json({
      error: {
        code: 'INVALID_SCAN_REQUEST',
        message: 'Scanner criteria are invalid.',
      },
      timestamp: new Date(),
    });
  }
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'AI Forex Platform API',
    version: API_VERSION,
    endpoints: {
      health: '/health',
      version: '/api/version',
      marketStatus: '/api/market/status',
      marketPairs: '/api/market/pairs',
      marketQuote: '/api/market/quote/:symbol',
      marketCandles: '/api/market/candles/:symbol',
      marketAnalysis: '/api/analysis/:symbol?timeframe=1h',
      tradingModes: '/api/trading-modes',
      tradingModeDetail: '/api/trading-modes/:mode',
      tradingContext: '/api/trading-context/:symbol?mode=SWING&timeframe=4h',
      opportunities: '/api/opportunities?mode=SWING&timeframe=4h',
      scanner: '/api/scanner?mode=SWING&timeframe=4h',
    },
  });
});

app.use((err: unknown, req: Request, res: Response) => {
  console.error('Unhandled API error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
    timestamp: new Date(),
  });
});

// AI Analysis endpoints
app.post('/api/ai/analysis', async (req: Request, res: Response) => {
  try {
    const body = z
      .object({
        symbol: z.string().trim().min(1),
        mode: z
          .string()
          .default(TradingMode.SWING)
          .transform((value) => {
            const mode = normalizeTradingMode(value);
            if (!mode) throw new Error('INVALID_TRADING_MODE');
            return mode;
          }),
        timeframe: z.string().default('1h'),
      })
      .parse(req.body);

    const symbol = body.symbol.toUpperCase();
    const mode = body.mode;
    const timeframe = body.timeframe as MarketTimeframe;

    let marketState: Partial<MarketState> | null = null;
    let currentPrice: number | null = null;

    try {
      const candles = await marketDataService.getHistoricalCandles(
        symbol,
        timeframe,
        220
      );

      if (candles.length > 0) {
        currentPrice = candles.at(-1)?.close ?? null;

        const analysis = marketIntelligenceService.analyzePair({
          symbol,
          timeframe,
          candles,
          source: marketDataService.getProviderName(),
          dataStatus: candles.length >= 50 ? 'ok' : 'insufficient_data',
          quote: currentPrice,
        });
        marketState = analysis;
      }
    } catch (error) {
      console.warn(`Failed to fetch market data for ${symbol}:`, error);
      marketState = null;
    }

    const opportunity = buildOpportunityFromMarketState(
      marketState ?? {},
      mode
    );

    const context: AIAnalysisContext = {
      symbol,
      tradingMode: mode,
      timeframe,
      currentPrice,
      marketState,
      opportunity: {
        direction: opportunity.direction,
        score: opportunity.score,
        confidence: opportunity.confidence,
        reasons: opportunity.reasons,
        riskFlags: opportunity.riskFlags,
      },
      marketDataSource: marketDataService.getProviderName(),
      marketDataMode:
        marketDataService.getProviderMode() === 'LIVE' ? 'LIVE' : 'MOCK',
    };

    const aiAnalysis = await aiAnalystService.analyze(context);
    await persistAIAnalysisHistory({
      ...aiAnalysis,
      direction: String(aiAnalysis.direction),
      assessment: String(aiAnalysis.assessment),
      tradingMode: String(aiAnalysis.tradingMode),
      timeframe: String(aiAnalysis.timeframe),
      marketDataMode: aiAnalysis.marketDataMode,
    });

    res.status(201).json(aiAnalysis);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('AI analysis error:', errorMessage);

    res.status(400).json({
      error: {
        code: 'AI_ANALYSIS_ERROR',
        message: `Failed to analyze market: ${errorMessage}`,
      },
      timestamp: new Date(),
    });
  }
});

app.get('/api/ai/analysis/:id', async (req: Request, res: Response) => {
  try {
    const id = idParamSchema.parse(req.params.id);
    const analysis = await prisma.aiAnalysisHistory.findUnique({
      where: { id },
    });

    if (!analysis) {
      return res.status(404).json({
        error: {
          code: 'ANALYSIS_NOT_FOUND',
          message: 'AI analysis history not found.',
        },
        timestamp: new Date(),
      });
    }

    return res.json(analysis);
  } catch (error) {
    res.status(400).json({
      error: {
        code: 'INVALID_REQUEST',
        message: 'Invalid analysis ID',
      },
      timestamp: new Date(),
    });
  }
});

app.post('/api/trade-proposals', async (req: Request, res: Response) => {
  try {
    const createTradeProposalSchema = z.object({
      symbol: z.string().trim().min(1),
      direction: z.string().trim().min(1),
      tradingMode: z.string().trim().min(1).default(TradingMode.SWING),
      tradingStyle: z.string().trim().optional(),
      aiAnalysisId: z.string().trim().min(1).optional(),
      strategyVersionId: z.string().trim().min(1).optional(),
      thesis: z.string().trim().optional(),
      status: tradeProposalStatusSchema.default(TradeProposalStatus.DRAFT),
      expiresAt: z.coerce.date().optional(),
    });
    const body: z.infer<typeof createTradeProposalSchema> =
      createTradeProposalSchema.parse(req.body);

    if (body.aiAnalysisId) {
      const analysis = await prisma.aiAnalysisHistory.findUnique({
        where: { id: body.aiAnalysisId },
      });
      if (!analysis) {
        return res.status(404).json({
          error: {
            code: 'AI_ANALYSIS_NOT_FOUND',
            message: 'AI analysis history not found.',
          },
          timestamp: new Date(),
        });
      }
    }

    if (body.strategyVersionId) {
      const strategyVersion = await prisma.strategyVersion.findUnique({
        where: { id: body.strategyVersionId },
      });
      if (!strategyVersion) {
        return res.status(404).json({
          error: {
            code: 'STRATEGY_VERSION_NOT_FOUND',
            message: 'Strategy version not found.',
          },
          timestamp: new Date(),
        });
      }
    }

    const proposal = await prisma.tradeProposal.create({
      data: {
        symbol: body.symbol.toUpperCase(),
        direction: body.direction.toUpperCase(),
        tradingMode: body.tradingMode,
        tradingStyle: body.tradingStyle ?? body.tradingMode,
        aiAnalysisId: body.aiAnalysisId ?? null,
        strategyVersionId: body.strategyVersionId ?? null,
        thesis:
          body.thesis ?? 'Draft proposal created for M7 lifecycle tracking.',
        status: body.status,
        approvalStatus: ApprovalStatus.PENDING,
        expiresAt: body.expiresAt ?? null,
      },
    });

    await prisma.journalEvent.create({
      data: {
        tradeProposalId: proposal.id,
        eventType: 'TRADE_PROPOSAL_CREATED',
        message: 'Trade proposal created for M7 lifecycle tracking.',
        metadata: {
          symbol: proposal.symbol,
          tradingMode: proposal.tradingMode,
        },
      },
    });

    return res.status(201).json(proposal);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({
      error: { code: 'INVALID_PROPOSAL', message },
      timestamp: new Date(),
    });
  }
});

app.get('/api/trade-proposals', async (req: Request, res: Response) => {
  const proposals = await prisma.tradeProposal.findMany({
    orderBy: { createdAt: 'desc' },
    include: { riskDecisions: true, journalEvents: true },
  });
  res.json({ count: proposals.length, proposals });
});

app.get('/api/trade-proposals/:id', async (req: Request, res: Response) => {
  const id = idParamSchema.parse(req.params.id);
  const proposal = await prisma.tradeProposal.findUnique({
    where: { id },
    include: {
      riskDecisions: true,
      journalEvents: true,
      orders: true,
      trades: true,
    },
  });

  if (!proposal) {
    return res.status(404).json({
      error: {
        code: 'PROPOSAL_NOT_FOUND',
        message: 'Trade proposal not found.',
      },
      timestamp: new Date(),
    });
  }

  return res.json(proposal);
});

app.post('/api/risk/decisions', async (req: Request, res: Response) => {
  try {
    const body = z
      .object({
        tradeProposalId: z.string().trim().min(1),
        status: riskDecisionStatusSchema,
        reason: z.string().trim().optional(),
        evaluator: z.string().trim().default('system'),
        riskFlags: z.record(z.any()).optional(),
      })
      .parse(req.body);

    const proposal = await prisma.tradeProposal.findUnique({
      where: { id: body.tradeProposalId },
    });
    if (!proposal) {
      return res.status(404).json({
        error: {
          code: 'PROPOSAL_NOT_FOUND',
          message: 'Trade proposal not found.',
        },
        timestamp: new Date(),
      });
    }

    const currentStatus = proposal.status;
    if (
      !isValidTradeProposalTransition(
        currentStatus,
        TradeProposalStatus.RISK_PENDING
      )
    ) {
      return res.status(400).json({
        error: {
          code: 'INVALID_TRANSITION',
          message: 'Proposal state transition is invalid.',
        },
        timestamp: new Date(),
      });
    }

    if (
      !isValidRiskDecisionTransition(RiskDecisionStatus.PENDING, body.status)
    ) {
      return res.status(400).json({
        error: {
          code: 'INVALID_TRANSITION',
          message: 'Risk decision state transition is invalid.',
        },
        timestamp: new Date(),
      });
    }

    const decision = await prisma.riskDecision.create({
      data: {
        tradeProposalId: body.tradeProposalId,
        status: body.status,
        reason: body.reason ?? null,
        riskFlags: body.riskFlags ?? null,
        evaluator: body.evaluator,
        evaluatedAt: new Date(),
      },
    });

    await prisma.journalEvent.create({
      data: {
        tradeProposalId: body.tradeProposalId,
        eventType: 'RISK_DECISION_CREATED',
        message: 'Risk decision captured for proposal.',
        metadata: { riskStatus: body.status },
      },
    });

    return res.status(201).json(decision);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({
      error: { code: 'INVALID_RISK_DECISION', message },
      timestamp: new Date(),
    });
  }
});

app.get('/api/risk/decisions/:id', async (req: Request, res: Response) => {
  const id = idParamSchema.parse(req.params.id);
  const decision = await prisma.riskDecision.findUnique({ where: { id } });
  if (!decision) {
    return res.status(404).json({
      error: {
        code: 'RISK_DECISION_NOT_FOUND',
        message: 'Risk decision not found.',
      },
      timestamp: new Date(),
    });
  }
  res.json(decision);
});

app.get('/api/orders', async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json({ count: orders.length, orders });
});

app.get('/api/orders/:id', async (req: Request, res: Response) => {
  const id = idParamSchema.parse(req.params.id);
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return res.status(404).json({
      error: { code: 'ORDER_NOT_FOUND', message: 'Order not found.' },
      timestamp: new Date(),
    });
  }
  return res.json(order);
});

app.get('/api/positions', async (req: Request, res: Response) => {
  const positions = await prisma.position.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json({ count: positions.length, positions });
});

app.get('/api/positions/:id', async (req: Request, res: Response) => {
  const id = idParamSchema.parse(req.params.id);
  const position = await prisma.position.findUnique({ where: { id } });
  if (!position) {
    return res.status(404).json({
      error: { code: 'POSITION_NOT_FOUND', message: 'Position not found.' },
      timestamp: new Date(),
    });
  }
  return res.json(position);
});

app.get('/api/trades', async (req: Request, res: Response) => {
  const trades = await prisma.trade.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json({ count: trades.length, trades });
});

app.get('/api/trades/:id', async (req: Request, res: Response) => {
  const id = idParamSchema.parse(req.params.id);
  const trade = await prisma.trade.findUnique({ where: { id } });
  if (!trade) {
    return res.status(404).json({
      error: { code: 'TRADE_NOT_FOUND', message: 'Trade not found.' },
      timestamp: new Date(),
    });
  }
  return res.json(trade);
});

app.get('/api/journal/events', async (req: Request, res: Response) => {
  const events = await prisma.journalEvent.findMany({
    orderBy: { timestamp: 'desc' },
  });
  res.json({ count: events.length, events });
});

app.get('/api/journal/events/:id', async (req: Request, res: Response) => {
  const id = idParamSchema.parse(req.params.id);
  const event = await prisma.journalEvent.findUnique({ where: { id } });
  if (!event) {
    return res.status(404).json({
      error: {
        code: 'JOURNAL_EVENT_NOT_FOUND',
        message: 'Journal event not found.',
      },
      timestamp: new Date(),
    });
  }
  return res.json(event);
});

app.get('/api/strategies/:id/versions', async (req: Request, res: Response) => {
  const id = idParamSchema.parse(req.params.id);
  const strategy = await prisma.strategy.findUnique({ where: { id } });
  if (!strategy) {
    return res.status(404).json({
      error: { code: 'STRATEGY_NOT_FOUND', message: 'Strategy not found.' },
      timestamp: new Date(),
    });
  }
  const versions = await prisma.strategyVersion.findMany({
    where: { strategyId: id },
    orderBy: { createdAt: 'desc' },
  });
  return res.json({ strategyId: id, count: versions.length, versions });
});

app.get('/api/ai/status', (req: Request, res: Response) => {
  res.json({
    provider: aiAnalystService.getProviderName(),
    model: aiAnalystService.getModelName(),
    status: 'operational',
    timestamp: new Date(),
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.path} not found`,
    },
    timestamp: new Date(),
  });
});

async function start() {
  console.log('API starting...');
  console.log(`Environment: ${APP_ENV}`);
  console.log(`Port: ${PORT}`);

  const database = await checkDatabaseHealth();
  if (database.connected) {
    console.log('Database: connected');
  } else {
    console.log('Database: unavailable');
  }

  console.log(
    `Market data provider: ${marketDataService.getProviderName()} (${marketDataService.getProviderMode()})`
  );

  app.listen(PORT, HOST, () => {
    console.log(`API ready on http://${HOST}:${PORT}`);
  });
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

start();
