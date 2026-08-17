import { describe, expect, it } from 'vitest';
import {
  MarketTrend,
  MomentumStrength,
  StrategyEvaluationInput,
  StrategySignal,
  StrategySignalDirection,
  TradingMode,
  TradingStyle,
  VolatilityRegime,
  MarketStructureType,
} from '@forex-platform/types';
import {
  buildAIAnalysisContextFromStrategySignal,
  buildStrategyEvaluationInput,
  evaluateStrategy,
  evaluateStrategyFromMarketContext,
} from './index';

describe('Strategy Engine skeleton and first deterministic strategy', () => {
  const neutralInput: StrategyEvaluationInput = {
    symbol: 'EURUSD',
    timeframe: '4h',
    marketState: {
      symbol: 'EURUSD',
      timeframe: '4h',
      timestamp: new Date('2026-01-01T00:00:00.000Z'),
      trend: MarketTrend.SIDEWAYS,
      momentum: MomentumStrength.NEUTRAL,
      volatility: VolatilityRegime.NORMAL,
      marketStructure: MarketStructureType.RANGE,
      supportLevels: [],
      resistanceLevels: [],
      indicators: {
        rsi: 50,
        ema20: 1.08,
        ema50: 1.06,
        ema100: 1.05,
        ema200: 1.02,
        macd: 0.001,
        signal: 0.0008,
        histogram: 0.0002,
        atr: 0.001,
        adx: 25,
        roc: 0.5,
        bollingerBands: null,
        valid: true,
        dataStatus: 'ok',
        source: 'mock',
      },
      source: 'mock',
      dataStatus: 'ok',
    },
    tradingMode: TradingMode.SWING,
    tradingStyle: TradingStyle.SWING,
    strategyId: 'strategy-001',
    parameters: {
      minConfidence: 60,
      filters: {
        requireTrend: true,
      },
    },
    strategyVersion: {
      id: 'strategy-version-001',
      strategyId: 'strategy-001',
      version: 'v1.0.0',
      name: 'Baseline Skeleton',
      status: 'ACTIVE',
      parameters: {
        minConfidence: 60,
      },
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  };

  function buildInput(
    trend: MarketTrend,
    momentum: MomentumStrength,
    overrides?: Partial<StrategyEvaluationInput>
  ): StrategyEvaluationInput {
    return {
      symbol: 'EURUSD',
      timeframe: '4h',
      marketState: {
        symbol: 'EURUSD',
        timeframe: '4h',
        timestamp: new Date('2026-01-01T00:00:00.000Z'),
        trend,
        momentum,
        volatility: VolatilityRegime.NORMAL,
        marketStructure: MarketStructureType.HIGHER_HIGHS,
        supportLevels: [],
        resistanceLevels: [],
        indicators: {
          rsi: 58,
          ema20: 1.08,
          ema50: 1.06,
          ema100: 1.05,
          ema200: 1.02,
          macd: 0.001,
          signal: 0.0008,
          histogram: 0.0002,
          atr: 0.001,
          adx: 25,
          roc: 0.5,
          bollingerBands: null,
          valid: true,
          dataStatus: 'ok',
          source: 'mock',
        },
        source: 'mock',
        dataStatus: 'ok',
      },
      tradingMode: TradingMode.SWING,
      tradingStyle: TradingStyle.SWING,
      strategyId: 'trend-following',
      parameters: {
        minConfidence: 65,
      },
      strategyVersion: {
        id: 'trend-following-v1',
        strategyId: 'trend-following',
        version: 'v1.0.0',
        name: 'Trend Following v1',
        status: 'ACTIVE',
        parameters: { minConfidence: 65 },
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      ...overrides,
    };
  }

  it('accepts a valid StrategyEvaluationInput and returns a valid StrategyEvaluationResult', () => {
    const result = evaluateStrategy(neutralInput);

    expect(result.symbol).toBe('EURUSD');
    expect(result.timeframe).toBe('4h');
    expect(result.tradingMode).toBe(TradingMode.SWING);
    expect(result.producedSignal).toBe(false);
    expect(result.signal).toBeNull();
    expect(result.strategyId).toBe('strategy-001');
    expect(result.strategyVersionId).toBe('strategy-version-001');
  });

  it('returns a no-signal result when the market is neutral or inconclusive', () => {
    const result = evaluateStrategy(neutralInput);

    expect(result.producedSignal).toBe(false);
    expect(result.signal).toBeNull();
    expect(result.metadata?.status).toBe('NO_SIGNAL');
  });

  it('is deterministic for the same input', () => {
    const first = evaluateStrategy(neutralInput);
    const second = evaluateStrategy(neutralInput);

    expect(first).toEqual(second);
  });

  it('does not create execution lifecycle objects or mutate the supplied input', () => {
    const snapshot = JSON.stringify(neutralInput);
    const result = evaluateStrategy(neutralInput);

    expect(result.signal).toBeNull();
    expect(result.metadata?.status).toBe('NO_SIGNAL');
    expect(JSON.stringify(neutralInput)).toBe(snapshot);
    expect(result.metadata).not.toHaveProperty('order');
    expect(result.metadata).not.toHaveProperty('trade');
    expect(result.metadata).not.toHaveProperty('portfolio');
    expect(result.metadata).not.toHaveProperty('riskDecision');
  });

  it('preserves strategy version identity in the result metadata', () => {
    const result = evaluateStrategy(neutralInput);

    expect(result.strategyVersionId).toBe('strategy-version-001');
    expect(result.metadata).toMatchObject({
      strategyVersion: 'v1.0.0',
      deterministic: true,
    });
  });

  it('does not expose strategy execution or downstream lifecycle contracts', () => {
    const result = evaluateStrategy(neutralInput);

    expect(result).not.toHaveProperty('order');
    expect(result).not.toHaveProperty('position');
    expect(result).not.toHaveProperty('trade');
    expect(result).not.toHaveProperty('tradeProposal');
    expect(result).not.toHaveProperty('riskDecision');
    expect(result).not.toHaveProperty('executionEvent');
    expect(result.signal).toBeNull();
    expect(StrategySignalDirection.LONG).toBe('LONG');
  });

  it('returns a LONG signal when trend and momentum confirm bullish conditions', () => {
    const result = evaluateStrategy(
      buildInput(MarketTrend.BULLISH, MomentumStrength.BULLISH)
    );

    expect(result.producedSignal).toBe(true);
    expect(result.signal).not.toBeNull();
    expect(result.signal?.direction).toBe(StrategySignalDirection.LONG);
    expect(result.signal?.strategyId).toBe('trend-following');
    expect(result.signal?.strategyVersionId).toBe('trend-following-v1');
    expect(result.signal?.confidence).toBe(74);
    expect(result.signal?.rationale).toEqual([
      'Trend and momentum confirm bullish conditions.',
    ]);
  });

  it('returns a SHORT signal when trend and momentum confirm bearish conditions', () => {
    const result = evaluateStrategy(
      buildInput(MarketTrend.BEARISH, MomentumStrength.BEARISH)
    );

    expect(result.producedSignal).toBe(true);
    expect(result.signal).not.toBeNull();
    expect(result.signal?.direction).toBe(StrategySignalDirection.SHORT);
    expect(result.signal?.strategyId).toBe('trend-following');
    expect(result.signal?.strategyVersionId).toBe('trend-following-v1');
    expect(result.signal?.confidence).toBe(74);
    expect(result.signal?.rationale).toEqual([
      'Trend and momentum confirm bearish conditions.',
    ]);
  });

  it('returns NO_SIGNAL when bullish trend is not confirmed by momentum', () => {
    const result = evaluateStrategy(
      buildInput(MarketTrend.BULLISH, MomentumStrength.NEUTRAL)
    );

    expect(result.producedSignal).toBe(false);
    expect(result.signal).toBeNull();
    expect(result.metadata?.status).toBe('NO_SIGNAL');
  });

  it('returns NO_SIGNAL when bearish trend is not confirmed by momentum', () => {
    const result = evaluateStrategy(
      buildInput(MarketTrend.BEARISH, MomentumStrength.NEUTRAL)
    );

    expect(result.producedSignal).toBe(false);
    expect(result.signal).toBeNull();
    expect(result.metadata?.status).toBe('NO_SIGNAL');
  });

  it('returns NO_SIGNAL for neutral or sideways trend states', () => {
    const result = evaluateStrategy(
      buildInput(MarketTrend.SIDEWAYS, MomentumStrength.STRONG_BULLISH)
    );

    expect(result.producedSignal).toBe(false);
    expect(result.signal).toBeNull();
    expect(result.metadata?.status).toBe('NO_SIGNAL');
  });

  it('returns NO_SIGNAL when market state information is insufficient', () => {
    const result = evaluateStrategy({
      symbol: 'EURUSD',
      timeframe: '4h',
      marketState: null,
      tradingMode: TradingMode.SWING,
      parameters: {},
    });

    expect(result.producedSignal).toBe(false);
    expect(result.signal).toBeNull();
    expect(result.metadata?.status).toBe('NO_SIGNAL');
  });

  it('evaluates the same input identically on repeated calls', () => {
    const first = evaluateStrategy(
      buildInput(MarketTrend.BULLISH, MomentumStrength.STRONG_BULLISH)
    );
    const second = evaluateStrategy(
      buildInput(MarketTrend.BULLISH, MomentumStrength.STRONG_BULLISH)
    );

    expect(first).toEqual(second);
  });

  it('does not mutate the input object during evaluation', () => {
    const input = buildInput(MarketTrend.BULLISH, MomentumStrength.BULLISH);
    const before = JSON.stringify(input);

    evaluateStrategy(input);

    expect(JSON.stringify(input)).toBe(before);
  });

  it('preserves the configured strategy identity and version in the signal', () => {
    const result = evaluateStrategy(
      buildInput(MarketTrend.BULLISH, MomentumStrength.STRONG_BULLISH)
    );

    expect(result.signal?.strategyId).toBe('trend-following');
    expect(result.signal?.strategyVersionId).toBe('trend-following-v1');
    expect(result.metadata).toMatchObject({
      strategyVersion: 'v1.0.0',
      status: 'SIGNAL',
    });
  });

  it('keeps the signal rationale derived only from the market state', () => {
    const result = evaluateStrategy(
      buildInput(MarketTrend.BEARISH, MomentumStrength.STRONG_BEARISH)
    );

    expect(result.signal?.rationale).toEqual([
      'Trend and momentum confirm bearish conditions.',
    ]);
  });

  it('does not produce downstream execution lifecycle artifacts', () => {
    const result = evaluateStrategy(
      buildInput(MarketTrend.BULLISH, MomentumStrength.BULLISH)
    );

    expect(result).not.toHaveProperty('order');
    expect(result).not.toHaveProperty('position');
    expect(result).not.toHaveProperty('trade');
    expect(result).not.toHaveProperty('tradeProposal');
    expect(result).not.toHaveProperty('riskDecision');
    expect(result.signal).not.toBeNull();
  });

  it('converts a LONG strategy signal into the correct AI/opportunity context', () => {
    const signal: StrategySignal = {
      id: 'signal-long-1',
      symbol: 'EURUSD',
      timeframe: '4h',
      direction: StrategySignalDirection.LONG,
      confidence: 82,
      rationale: ['Trend and momentum confirm bullish conditions.'],
      strategyId: 'trend-following',
      strategyVersionId: 'trend-following-v1',
      evaluatedAt: new Date('2026-01-01T00:00:00.000Z'),
      metadata: {
        deterministic: true,
      },
    };

    const context = buildAIAnalysisContextFromStrategySignal({
      signal,
      symbol: 'EURUSD',
      timeframe: '4h',
      tradingMode: TradingMode.SWING,
      tradingStyle: TradingStyle.SWING,
      marketState: {
        symbol: 'EURUSD',
        timeframe: '4h',
        trend: MarketTrend.BULLISH,
        momentum: MomentumStrength.BULLISH,
        dataStatus: 'ok',
      },
      currentPrice: 1.0955,
      marketDataSource: 'strategy-engine',
      marketDataMode: 'MOCK',
    });

    expect(context.symbol).toBe('EURUSD');
    expect(context.timeframe).toBe('4h');
    expect(context.tradingMode).toBe(TradingMode.SWING);
    expect(context.opportunity.direction).toBe('LONG');
    expect(context.opportunity.score).toBe(82);
    expect(context.opportunity.confidence).toBe(82);
    expect(context.opportunity.reasons).toContain(
      'Strategy trend-following/trend-following-v1 produced LONG signal.'
    );
    expect(context.marketState?.trend).toBe(MarketTrend.BULLISH);
  });

  it('converts a SHORT strategy signal into the correct AI/opportunity context', () => {
    const signal: StrategySignal = {
      id: 'signal-short-1',
      symbol: 'EURUSD',
      timeframe: '4h',
      direction: StrategySignalDirection.SHORT,
      confidence: 79,
      rationale: ['Trend and momentum confirm bearish conditions.'],
      strategyId: 'trend-following',
      strategyVersionId: 'trend-following-v1',
      evaluatedAt: new Date('2026-01-01T00:00:00.000Z'),
      metadata: {
        deterministic: true,
      },
    };

    const context = buildAIAnalysisContextFromStrategySignal({
      signal,
      symbol: 'EURUSD',
      timeframe: '4h',
      tradingMode: TradingMode.SWING,
      marketState: {
        symbol: 'EURUSD',
        timeframe: '4h',
        trend: MarketTrend.BEARISH,
        momentum: MomentumStrength.BEARISH,
        dataStatus: 'ok',
      },
      marketDataSource: 'strategy-engine',
      marketDataMode: 'MOCK',
    });

    expect(context.opportunity.direction).toBe('SHORT');
    expect(context.opportunity.score).toBe(79);
    expect(context.opportunity.confidence).toBe(79);
    expect(context.opportunity.reasons).toContain(
      'Trend and momentum confirm bearish conditions.'
    );
    expect(context.marketState?.trend).toBe(MarketTrend.BEARISH);
  });

  it('keeps a NO_SIGNAL result explicitly non-actionable', () => {
    const context = buildAIAnalysisContextFromStrategySignal({
      signal: null,
      symbol: 'EURUSD',
      timeframe: '4h',
      tradingMode: TradingMode.SWING,
      marketState: {
        symbol: 'EURUSD',
        timeframe: '4h',
        trend: MarketTrend.SIDEWAYS,
        momentum: MomentumStrength.NEUTRAL,
        dataStatus: 'ok',
      },
      marketDataSource: 'strategy-engine',
      marketDataMode: 'MOCK',
    });

    expect(context.opportunity.direction).toBe('NEUTRAL');
    expect(context.opportunity.score).toBe(0);
    expect(context.opportunity.confidence).toBe(0);
    expect(context.opportunity.reasons).toContain(
      'Strategy produced NO_SIGNAL.'
    );
    expect(context.opportunity.riskFlags).toContain(
      'No actionable signal from Strategy Engine.'
    );
  });

  it('preserves signal fields and keeps the transformation deterministic', () => {
    const signal: StrategySignal = {
      id: 'signal-x',
      symbol: 'EURUSD',
      timeframe: '4h',
      direction: StrategySignalDirection.LONG,
      confidence: 88,
      rationale: ['Trend and momentum confirm bullish conditions.'],
      strategyId: 'trend-following',
      strategyVersionId: 'trend-following-v1',
      evaluatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    const first = buildAIAnalysisContextFromStrategySignal({
      signal,
      symbol: 'EURUSD',
      timeframe: '4h',
      tradingMode: TradingMode.SWING,
      currentPrice: 1.1,
      marketState: {
        symbol: 'EURUSD',
        timeframe: '4h',
        trend: MarketTrend.BULLISH,
        momentum: MomentumStrength.STRONG_BULLISH,
        dataStatus: 'ok',
      },
      marketDataSource: 'strategy-engine',
      marketDataMode: 'MOCK',
    });

    const second = buildAIAnalysisContextFromStrategySignal({
      signal,
      symbol: 'EURUSD',
      timeframe: '4h',
      tradingMode: TradingMode.SWING,
      currentPrice: 1.1,
      marketState: {
        symbol: 'EURUSD',
        timeframe: '4h',
        trend: MarketTrend.BULLISH,
        momentum: MomentumStrength.STRONG_BULLISH,
        dataStatus: 'ok',
      },
      marketDataSource: 'strategy-engine',
      marketDataMode: 'MOCK',
    });

    expect(first).toEqual(second);
    expect(first.opportunity.confidence).toBe(88);
    expect(first.opportunity.reasons).toContain(
      'Strategy trend-following/trend-following-v1 produced LONG signal.'
    );
  });

  it('does not mutate input objects and does not create downstream lifecycle objects', () => {
    const signal: StrategySignal = {
      id: 'signal-y',
      symbol: 'EURUSD',
      timeframe: '4h',
      direction: StrategySignalDirection.LONG,
      confidence: 70,
      rationale: ['Trend and momentum confirm bullish conditions.'],
      strategyId: 'trend-following',
      strategyVersionId: 'trend-following-v1',
      evaluatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    const original = JSON.stringify({
      signal,
      symbol: 'EURUSD',
      timeframe: '4h',
      tradingMode: TradingMode.SWING,
      marketState: {
        symbol: 'EURUSD',
        timeframe: '4h',
        trend: MarketTrend.BULLISH,
        momentum: MomentumStrength.BULLISH,
        dataStatus: 'ok',
      },
    });

    const context = buildAIAnalysisContextFromStrategySignal({
      signal,
      symbol: 'EURUSD',
      timeframe: '4h',
      tradingMode: TradingMode.SWING,
      marketState: {
        symbol: 'EURUSD',
        timeframe: '4h',
        trend: MarketTrend.BULLISH,
        momentum: MomentumStrength.BULLISH,
        dataStatus: 'ok',
      },
      marketDataSource: 'strategy-engine',
      marketDataMode: 'MOCK',
    });

    expect(
      JSON.stringify({
        signal,
        symbol: 'EURUSD',
        timeframe: '4h',
        tradingMode: TradingMode.SWING,
        marketState: {
          symbol: 'EURUSD',
          timeframe: '4h',
          trend: MarketTrend.BULLISH,
          momentum: MomentumStrength.BULLISH,
          dataStatus: 'ok',
        },
      })
    ).toBe(original);
    expect(context).not.toHaveProperty('tradeProposal');
    expect(context).not.toHaveProperty('riskDecision');
    expect(context).not.toHaveProperty('order');
    expect(context).not.toHaveProperty('trade');
  });

  it('builds a StrategyEvaluationInput from upstream market context without mutating it', () => {
    const marketState: Partial<StrategyEvaluationInput['marketState']> = {
      symbol: 'EURUSD',
      timeframe: '1h',
      timestamp: new Date('2026-01-01T00:00:00.000Z'),
      trend: MarketTrend.BULLISH,
      momentum: MomentumStrength.BULLISH,
      volatility: VolatilityRegime.NORMAL,
      marketStructure: MarketStructureType.HIGHER_HIGHS,
      supportLevels: [],
      resistanceLevels: [],
      indicators: {
        rsi: 60,
        ema20: 1.08,
        ema50: 1.06,
        ema100: 1.05,
        ema200: 1.02,
        macd: 0.001,
        signal: 0.0008,
        histogram: 0.0002,
        atr: 0.001,
        adx: 25,
        roc: 0.5,
        bollingerBands: null,
        valid: true,
        dataStatus: 'ok',
        source: 'mock',
      },
      source: 'mock',
      dataStatus: 'ok',
    };

    const before = JSON.stringify(marketState);
    const input = buildStrategyEvaluationInput({
      marketState,
      tradingMode: TradingMode.SWING,
      tradingStyle: TradingStyle.SWING,
      strategyId: 'trend-following',
      parameters: { minConfidence: 60 },
      strategyVersion: {
        id: 'trend-following-v1',
        strategyId: 'trend-following',
        version: 'v1.0.0',
        name: 'Trend Following v1',
        status: 'ACTIVE',
        parameters: { minConfidence: 60 },
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      opportunity: {
        direction: 'LONG',
        score: 80,
        confidence: 80,
        reasons: ['Opportunity is constructive.'],
        riskFlags: [],
      },
    });

    expect(JSON.stringify(marketState)).toBe(before);
    expect(input.marketState).toBeDefined();
    expect(input.tradingMode).toBe(TradingMode.SWING);
    expect(input.tradingStyle).toBe(TradingStyle.SWING);
    expect(input.strategyVersion?.id).toBe('trend-following-v1');
    expect(input.parameters).toEqual({ minConfidence: 60 });
  });

  it('evaluates upstream market context through the pipeline without creating downstream lifecycle objects', () => {
    const marketState = {
      symbol: 'EURUSD',
      timeframe: '4h',
      timestamp: new Date('2026-01-01T00:00:00.000Z'),
      trend: MarketTrend.BULLISH,
      momentum: MomentumStrength.STRONG_BULLISH,
      volatility: VolatilityRegime.NORMAL,
      marketStructure: MarketStructureType.BREAKOUT,
      supportLevels: [],
      resistanceLevels: [],
      indicators: {
        rsi: 68,
        ema20: 1.08,
        ema50: 1.06,
        ema100: 1.05,
        ema200: 1.02,
        macd: 0.001,
        signal: 0.0008,
        histogram: 0.0002,
        atr: 0.001,
        adx: 25,
        roc: 0.5,
        bollingerBands: null,
        valid: true,
        dataStatus: 'ok',
        source: 'mock',
      },
      source: 'mock',
      dataStatus: 'ok',
    } satisfies StrategyEvaluationInput['marketState'];

    const result = evaluateStrategyFromMarketContext({
      marketState,
      tradingMode: TradingMode.SWING,
      tradingStyle: TradingStyle.SWING,
      strategyId: 'trend-following',
      parameters: { minConfidence: 60 },
      strategyVersion: {
        id: 'trend-following-v1',
        strategyId: 'trend-following',
        version: 'v1.0.0',
        name: 'Trend Following v1',
        status: 'ACTIVE',
        parameters: { minConfidence: 60 },
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      opportunity: {
        direction: 'LONG',
        score: 90,
        confidence: 90,
        reasons: ['Trend and momentum confirm bullish conditions.'],
        riskFlags: [],
      },
    });

    expect(result.producedSignal).toBe(true);
    expect(result.signal?.direction).toBe(StrategySignalDirection.LONG);
    expect(result.metadata?.opportunity).toMatchObject({
      direction: 'LONG',
      score: 90,
      confidence: 90,
    });
    expect(result).not.toHaveProperty('tradeProposal');
    expect(result).not.toHaveProperty('riskDecision');
    expect(result).not.toHaveProperty('order');
    expect(result).not.toHaveProperty('position');
    expect(result).not.toHaveProperty('trade');
  });

describe('Strategy Engine - StrategyParameters support (M8 Phase 6)', () => {
  const bullishInput: StrategyEvaluationInput = {
    symbol: 'EURUSD',
    timeframe: '4h',
    marketState: {
      symbol: 'EURUSD',
      timeframe: '4h',
      timestamp: new Date('2026-01-01T00:00:00.000Z'),
      trend: MarketTrend.BULLISH,
      momentum: MomentumStrength.BULLISH,
      volatility: VolatilityRegime.NORMAL,
      marketStructure: MarketStructureType.HIGHER_HIGHS,
      supportLevels: [],
      resistanceLevels: [],
      indicators: {
        rsi: 58,
        ema20: 1.08,
        ema50: 1.06,
        ema100: 1.05,
        ema200: 1.02,
        macd: 0.001,
        signal: 0.0008,
        histogram: 0.0002,
        atr: 0.001,
        adx: 25,
        roc: 0.5,
        bollingerBands: null,
        valid: true,
        dataStatus: 'ok',
        source: 'mock',
      },
      source: 'mock',
      dataStatus: 'ok',
    },
    tradingMode: TradingMode.SWING,
    tradingStyle: TradingStyle.SWING,
    strategyId: 'trend-following',
    parameters: {},
    strategyVersion: {
      id: 'trend-following-v1',
      strategyId: 'trend-following',
      version: 'v1.0.0',
      name: 'Trend Following v1',
      status: 'ACTIVE',
      parameters: {},
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  };

  const strongBullishInput: StrategyEvaluationInput = {
    ...bullishInput,
    marketState: {...bullishInput.marketState!,momentum: MomentumStrength.STRONG_BULLISH,},
  };

  const bearishInput: StrategyEvaluationInput = {
    ...bullishInput,
    marketState: {...bullishInput.marketState!,trend: MarketTrend.BEARISH,momentum: MomentumStrength.BEARISH,},
  };

  const strongBearishInput: StrategyEvaluationInput = {
    ...bullishInput,
    marketState: {...bullishInput.marketState!,trend: MarketTrend.BEARISH,momentum: MomentumStrength.STRONG_BEARISH,},
  };

  it('produces LONG signal when parameters are omitted', () => {
    const r = evaluateStrategy({...bullishInput, parameters: {}});
    expect(r.producedSignal).toBe(true);
    expect(r.signal?.direction).toBe(StrategySignalDirection.LONG);
    expect(r.signal?.confidence).toBe(74);
  });

  it('produces LONG signal when confidence meets threshold', () => {
    const r = evaluateStrategy({...bullishInput, parameters: {minimumConfidence: 60}});
    expect(r.producedSignal).toBe(true);
    expect(r.signal?.direction).toBe(StrategySignalDirection.LONG);
    expect(r.signal?.confidence).toBe(74);
  });

  it('produces SHORT signal when confidence meets threshold', () => {
    const r = evaluateStrategy({...bearishInput, parameters: {minimumConfidence: 60}});
    expect(r.producedSignal).toBe(true);
    expect(r.signal?.direction).toBe(StrategySignalDirection.SHORT);
    expect(r.signal?.confidence).toBe(74);
  });

  it('produces NO_SIGNAL when confidence below threshold', () => {
    const r = evaluateStrategy({...bullishInput, parameters: {minimumConfidence: 80}});
    expect(r.producedSignal).toBe(false);
    expect(r.signal).toBeNull();
    expect(r.metadata?.reason).toContain('confidence below threshold');
  });

  it('uses default minimumConfidence when missing', () => {
    const r = evaluateStrategy({...bullishInput, parameters: {otherParam: 'value'}});
    expect(r.producedSignal).toBe(true);
  });

  it('falls back to default for wrong type', () => {
    const r = evaluateStrategy({...bullishInput, parameters: {minimumConfidence: 'bad' as never}});
    expect(r.producedSignal).toBe(true);
  });

  it('falls back to default for NaN', () => {
    const r = evaluateStrategy({...bullishInput, parameters: {minimumConfidence: NaN}});
    expect(r.producedSignal).toBe(true);
  });

  it('falls back to default for Infinity', () => {
    const r = evaluateStrategy({...bullishInput, parameters: {minimumConfidence: Infinity}});
    expect(r.producedSignal).toBe(true);
  });

  it('falls back to default for negative', () => {
    const r = evaluateStrategy({...bullishInput, parameters: {minimumConfidence: -50}});
    expect(r.producedSignal).toBe(true);
  });

  it('falls back to default exceeds 100', () => {
    const r = evaluateStrategy({...bullishInput, parameters: {minimumConfidence: 150}});
    expect(r.producedSignal).toBe(true);
  });

  it('identical inputs produce identical results', () => {
    const i1 = {...bullishInput, parameters: {minimumConfidence: 70}};
    const i2 = {...bullishInput, parameters: {minimumConfidence: 70}};
    const r1 = evaluateStrategy(i1);
    const r2 = evaluateStrategy(i2);
    expect(r1).toEqual(r2);
  });

  it('does not mutate parameters', () => {
    const params = {minimumConfidence: 70};
    const before = JSON.stringify(params);
    evaluateStrategy({...bullishInput, parameters: params});
    expect(JSON.stringify(params)).toBe(before);
  });

  it('preserves strategy identity', () => {
    const r1 = evaluateStrategy({...bullishInput, parameters: {minimumConfidence: 60}});
    const r2 = evaluateStrategy({...bullishInput, parameters: {minimumConfidence: 90}});
    expect(r1.strategyId).toBe(r2.strategyId);
    expect(r1.strategyVersionId).toBe(r2.strategyVersionId);
  });

  it('preserves opportunity metadata', () => {
    const r = evaluateStrategy({...bullishInput, parameters: {minimumConfidence: 60}});
    expect(r.metadata?.strategyParameters).toBeDefined();
  });

  it('no lifecycle objects created', () => {
    const r = evaluateStrategy({...bullishInput, parameters: {minimumConfidence: 80}});
    expect(r).not.toHaveProperty('order');
    expect(r).not.toHaveProperty('trade');
    expect(r).not.toHaveProperty('tradeProposal');
  });

  it('STRONG_BULLISH with high threshold', () => {
    const r = evaluateStrategy({...strongBullishInput, parameters: {minimumConfidence: 85}});
    expect(r.producedSignal).toBe(true);
    expect(r.signal?.confidence).toBe(85);
  });

  it('STRONG_BEARISH with high threshold', () => {
    const r = evaluateStrategy({...strongBearishInput, parameters: {minimumConfidence: 85}});
    expect(r.producedSignal).toBe(true);
    expect(r.signal?.confidence).toBe(85);
  });

  it('confidence exactly at threshold', () => {
    const r = evaluateStrategy({...bullishInput, parameters: {minimumConfidence: 74}});
    expect(r.producedSignal).toBe(true);
  });

  it('confidence 1 below threshold', () => {
    const r = evaluateStrategy({...bullishInput, parameters: {minimumConfidence: 75}});
    expect(r.producedSignal).toBe(false);
  });
});
});
