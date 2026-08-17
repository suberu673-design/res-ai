import { describe, expect, it } from 'vitest';
import {
  MarketTrend,
  MomentumStrength,
  StrategyEvaluationInput,
  StrategySignalDirection,
  TradingMode,
  TradingStyle,
  VolatilityRegime,
  MarketStructureType,
} from '@forex-platform/types';
import { evaluateStrategy } from './index';

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
});
