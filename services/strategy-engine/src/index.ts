import {
  AIAnalysisContext,
  MarketTrend,
  MomentumStrength,
  StrategyEvaluationInput,
  StrategyEvaluationResult,
  StrategySignal,
  StrategySignalDirection,
  StrategyParameters,
  StrategyVersion,
  TradingMode,
  TradingStyle,
  type MarketState,
} from '@forex-platform/types';

export const TREND_FOLLOWING_STRATEGY_ID = 'trend-following';
export const TREND_FOLLOWING_STRATEGY_VERSION = 'v1.0.0';
export const TREND_FOLLOWING_STRATEGY_VERSION_ID = `${TREND_FOLLOWING_STRATEGY_ID}-${TREND_FOLLOWING_STRATEGY_VERSION}`;

function getStrategyIdentity(input: StrategyEvaluationInput) {
  const strategyId =
    input.strategyVersion?.strategyId ??
    input.strategyId ??
    TREND_FOLLOWING_STRATEGY_ID;

  const explicitStrategyVersionId = input.strategyVersion?.id ?? null;
  const versionValue =
    input.strategyVersion?.version ?? TREND_FOLLOWING_STRATEGY_VERSION;
  const majorVersion = versionValue.replace(/^v/i, '').split('.')[0] ?? '1';
  const generatedStrategyVersionId = `${strategyId}-v${majorVersion}`;

  return {
    strategyId,
    strategyVersionId:
      explicitStrategyVersionId ??
      generatedStrategyVersionId ??
      TREND_FOLLOWING_STRATEGY_VERSION_ID,
    strategyVersion: versionValue,
  };
}

function buildNoSignalResult(
  input: StrategyEvaluationInput,
  reason: string,
  strategyId: string,
  strategyVersionId: string | null,
  strategyVersion: string
): StrategyEvaluationResult {
  return {
    strategyId,
    strategyVersionId,
    symbol: input.symbol,
    timeframe: input.timeframe,
    tradingMode: input.tradingMode,
    producedSignal: false,
    signal: null,
    metadata: {
      strategyVersion,
      strategyParameters: input.parameters,
      tradingStyle: input.tradingStyle ?? null,
      status: 'NO_SIGNAL',
      deterministic: true,
      reason,
      marketStateSnapshot: input.marketState
        ? {
            symbol: input.marketState.symbol ?? input.symbol,
            timeframe: input.marketState.timeframe ?? input.timeframe,
            trend: input.marketState.trend ?? null,
            momentum: input.marketState.momentum ?? null,
            dataStatus: input.marketState.dataStatus ?? null,
          }
        : null,
    },
  };
}

function buildSignal(
  input: StrategyEvaluationInput,
  direction: StrategySignalDirection,
  strategyId: string,
  strategyVersionId: string | null,
  strategyVersion: string,
  rationale: string
): StrategySignal {
  const confidence =
    direction === StrategySignalDirection.LONG
      ? input.marketState?.momentum === MomentumStrength.STRONG_BULLISH
        ? 85
        : 74
      : input.marketState?.momentum === MomentumStrength.STRONG_BEARISH
        ? 85
        : 74;

  return {
    id: `${strategyId}-${input.symbol}-${input.timeframe}-${direction.toLowerCase()}`,
    symbol: input.symbol,
    timeframe: input.timeframe,
    direction,
    confidence,
    rationale: [rationale],
    strategyId,
    strategyVersionId,
    metadata: {
      strategyVersion,
      trend: input.marketState?.trend ?? null,
      momentum: input.marketState?.momentum ?? null,
      deterministic: true,
    },
  };
}

/**
 * Minimal deterministic trend-following strategy.
 * Long requires bullish trend + confirming bullish momentum.
 * Short requires bearish trend + confirming bearish momentum.
 * Any disagreement, neutral state, or insufficient market information produces NO_SIGNAL.
 */
export function evaluateStrategy(
  input: StrategyEvaluationInput
): StrategyEvaluationResult {
  const { strategyId, strategyVersionId, strategyVersion } =
    getStrategyIdentity(input);
  const marketState = input.marketState;

  if (!marketState) {
    return buildNoSignalResult(
      input,
      'Market state is unavailable; trend and momentum cannot be confirmed.',
      strategyId,
      strategyVersionId,
      strategyVersion
    );
  }

  const trend = marketState.trend;
  const momentum = marketState.momentum;

  if (
    !trend ||
    !momentum ||
    trend === MarketTrend.UNKNOWN ||
    trend === MarketTrend.SIDEWAYS ||
    momentum === MomentumStrength.NEUTRAL
  ) {
    return buildNoSignalResult(
      input,
      'Trend and momentum are neutral, unclear, or unavailable.',
      strategyId,
      strategyVersionId,
      strategyVersion
    );
  }

  const bullishConfirmation =
    trend === MarketTrend.BULLISH &&
    (momentum === MomentumStrength.BULLISH ||
      momentum === MomentumStrength.STRONG_BULLISH);

  const bearishConfirmation =
    trend === MarketTrend.BEARISH &&
    (momentum === MomentumStrength.BEARISH ||
      momentum === MomentumStrength.STRONG_BEARISH);

  if (bullishConfirmation) {
    const signal = buildSignal(
      input,
      StrategySignalDirection.LONG,
      strategyId,
      strategyVersionId,
      strategyVersion,
      'Trend and momentum confirm bullish conditions.'
    );

    return {
      strategyId,
      strategyVersionId,
      symbol: input.symbol,
      timeframe: input.timeframe,
      tradingMode: input.tradingMode,
      producedSignal: true,
      signal,
      metadata: {
        strategyVersion,
        strategyParameters: input.parameters,
        tradingStyle: input.tradingStyle ?? null,
        status: 'SIGNAL',
        deterministic: true,
        reason: 'Trend and momentum confirm bullish conditions.',
      },
    };
  }

  if (bearishConfirmation) {
    const signal = buildSignal(
      input,
      StrategySignalDirection.SHORT,
      strategyId,
      strategyVersionId,
      strategyVersion,
      'Trend and momentum confirm bearish conditions.'
    );

    return {
      strategyId,
      strategyVersionId,
      symbol: input.symbol,
      timeframe: input.timeframe,
      tradingMode: input.tradingMode,
      producedSignal: true,
      signal,
      metadata: {
        strategyVersion,
        strategyParameters: input.parameters,
        tradingStyle: input.tradingStyle ?? null,
        status: 'SIGNAL',
        deterministic: true,
        reason: 'Trend and momentum confirm bearish conditions.',
      },
    };
  }

  return buildNoSignalResult(
    input,
    'Trend and momentum do not confirm a decisive directional move.',
    strategyId,
    strategyVersionId,
    strategyVersion
  );
}

export interface BuildStrategyEvaluationInputInput {
  marketState: Partial<MarketState> | null;
  tradingMode: TradingMode;
  tradingStyle?: TradingStyle | null;
  strategyId?: string | null;
  strategyVersion?: Pick<
    StrategyVersion,
    | 'id'
    | 'strategyId'
    | 'version'
    | 'name'
    | 'status'
    | 'parameters'
    | 'createdAt'
    | 'updatedAt'
  > | null;
  parameters?: StrategyParameters;
  symbol?: string;
  timeframe?: string;
  opportunity?: {
    direction?: string | null;
    score?: number | null;
    confidence?: number | null;
    reasons?: string[] | null;
    riskFlags?: string[] | null;
  } | null;
}

export function buildStrategyEvaluationInput(
  input: BuildStrategyEvaluationInputInput
): StrategyEvaluationInput {
  const marketState = input.marketState ?? null;
  const symbol = input.symbol ?? marketState?.symbol ?? 'UNKNOWN';
  const timeframe = input.timeframe ?? marketState?.timeframe ?? '1h';
  const parameters = input.parameters ?? {};

  return {
    symbol,
    timeframe,
    marketState,
    tradingMode: input.tradingMode,
    tradingStyle: input.tradingStyle ?? null,
    strategyId: input.strategyId ?? input.strategyVersion?.strategyId ?? null,
    strategyVersion: input.strategyVersion ?? null,
    parameters,
  };
}

export function evaluateStrategyFromMarketContext(
  input: BuildStrategyEvaluationInputInput
): StrategyEvaluationResult {
  const evaluationInput = buildStrategyEvaluationInput(input);
  const result = evaluateStrategy(evaluationInput);

  if (!input.opportunity) {
    return result;
  }

  return {
    ...result,
    metadata: {
      ...(result.metadata ?? {}),
      opportunity: {
        direction: input.opportunity.direction ?? null,
        score: input.opportunity.score ?? null,
        confidence: input.opportunity.confidence ?? null,
        reasons: input.opportunity.reasons ?? [],
        riskFlags: input.opportunity.riskFlags ?? [],
      },
    },
  };
}

export interface StrategySignalToAIAnalysisContextInput {
  signal: StrategySignal | null;
  symbol: string;
  timeframe: string;
  tradingMode: TradingMode;
  tradingStyle?: TradingStyle | null;
  marketState?: Partial<MarketState> | null;
  currentPrice?: number | null;
  marketDataSource?: string;
  marketDataMode?: 'LIVE' | 'MOCK';
}

export function buildAIAnalysisContextFromStrategySignal(
  input: StrategySignalToAIAnalysisContextInput
): AIAnalysisContext {
  const signal = input.signal;
  const direction =
    signal?.direction === StrategySignalDirection.LONG
      ? 'LONG'
      : signal?.direction === StrategySignalDirection.SHORT
        ? 'SHORT'
        : 'NEUTRAL';

  const rationale = signal?.rationale ? [...signal.rationale] : [];
  const strategyIdentity = signal?.strategyId
    ? `${signal.strategyId}${signal.strategyVersionId ? `/${signal.strategyVersionId}` : ''}`
    : 'strategy-engine';

  if (!signal) {
    return {
      symbol: input.symbol,
      tradingMode: input.tradingMode,
      timeframe: input.timeframe,
      currentPrice: input.currentPrice ?? null,
      marketState: input.marketState ?? null,
      opportunity: {
        direction: 'NEUTRAL',
        score: 0,
        confidence: 0,
        reasons: [
          'Strategy produced NO_SIGNAL.',
          `Strategy ${strategyIdentity} did not produce an actionable signal.`,
        ],
        riskFlags: ['No actionable signal from Strategy Engine.'],
      },
      marketDataSource: input.marketDataSource ?? 'strategy-engine',
      marketDataMode: input.marketDataMode ?? 'MOCK',
    };
  }

  const normalizedConfidence = Math.max(
    0,
    Math.min(100, Math.round(signal.confidence))
  );

  const reasons = [
    ...rationale,
    `Strategy ${strategyIdentity} produced ${signal.direction} signal.`,
  ];

  return {
    symbol: input.symbol,
    tradingMode: input.tradingMode,
    timeframe: input.timeframe,
    currentPrice: input.currentPrice ?? null,
    marketState: input.marketState ?? null,
    opportunity: {
      direction,
      score: normalizedConfidence,
      confidence: normalizedConfidence,
      reasons,
      riskFlags: [
        ...(signal.direction === StrategySignalDirection.LONG
          ? []
          : signal.direction === StrategySignalDirection.SHORT
            ? []
            : ['No actionable signal from Strategy Engine.']),
      ],
    },
    marketDataSource: input.marketDataSource ?? 'strategy-engine',
    marketDataMode: input.marketDataMode ?? 'MOCK',
  };
}

export default evaluateStrategy;
