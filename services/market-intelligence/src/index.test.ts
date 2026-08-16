import { describe, expect, it } from 'vitest';
import { MarketIntelligenceService, calculateEMA, calculateMACD, calculateRSI, calculateSMA, classifyMomentum, classifyTrend, classifyVolatility, detectMarketStructure, detectSupportResistance, deriveCurrencyStrength } from './index';
import { MarketTimeframe } from '@forex-platform/types';

const candles = Array.from({ length: 220 }, (_, index) => {
  const base = 1.1 + index * 0.0008;
  return {
    symbol: 'EUR/USD',
    timeframe: MarketTimeframe.ONE_HOUR,
    timestamp: new Date(Date.UTC(2024, 0, 1, index)),
    open: base,
    high: base + 0.001,
    low: base - 0.001,
    close: base + (index % 10 === 0 ? 0.004 : 0.001),
    volume: 1000,
    source: 'mock',
  };
});

describe('market-intelligence', () => {
  it('calculates a simple SMA', () => {
    expect(calculateSMA([1, 2, 3, 4, 5], 3)).toBeCloseTo(4, 5);
  });

  it('calculates EMA with a valid warmup', () => {
    const ema = calculateEMA([1, 2, 3, 4, 5], 3);
    expect(ema).toBeGreaterThan(0);
    expect(Number.isFinite(ema)).toBe(true);
    expect(Number.isNaN(ema ?? 0)).toBe(false);
  });

  it('calculates RSI deterministically', () => {
    const rsi = calculateRSI([44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65], 14);
    expect(rsi).toBeGreaterThan(50);
    expect(Number.isFinite(rsi)).toBe(true);
  });

  it('calculates MACD and signal outputs', () => {
    const macd = calculateMACD([1, 1.01, 1.02, 1.03, 1.04, 1.05, 1.06, 1.07, 1.08, 1.09, 1.1, 1.11], 12, 26, 9);
    expect(Number.isFinite(macd.macd ?? NaN)).toBe(true);
    expect(Number.isFinite(macd.signal ?? NaN)).toBe(true);
    expect(Number.isFinite(macd.histogram ?? NaN)).toBe(true);
  });

  it('detects bullish trend on aligned moving averages', () => {
    const trend = classifyTrend({
      latestClose: 1.12,
      ema20: 1.11,
      ema50: 1.10,
      ema200: 1.09,
      recentHigh: 1.14,
      recentLow: 1.07,
      marketStructure: 'HIGHER_HIGHS',
    });
    expect(trend).toBe('BULLISH');
  });

  it('classifies momentum realistically', () => {
    expect(classifyMomentum({ rsi: 72, macd: 0.005, signal: 0.001, roc: 0.015 })).toBe('STRONG_BULLISH');
    expect(classifyMomentum({ rsi: 52, macd: 0.0005, signal: 0.0002, roc: 0.001 })).toBe('BULLISH');
    expect(classifyMomentum({ rsi: 49, macd: -0.0001, signal: 0.0001, roc: -0.003 })).toBe('BEARISH');
  });

  it('classifies volatility into project-defined regimes', () => {
    expect(classifyVolatility(0.0004)).toBe('LOW');
    expect(classifyVolatility(0.0008)).toBe('NORMAL');
    expect(classifyVolatility(0.0015)).toBe('HIGH');
    expect(classifyVolatility(0.003)).toBe('EXTREME');
  });

  it('detects market structure from recent swings', () => {
    const structure = detectMarketStructure([
      { high: 1.10, low: 1.08, close: 1.09 },
      { high: 1.11, low: 1.09, close: 1.10 },
      { high: 1.12, low: 1.10, close: 1.11 },
      { high: 1.13, low: 1.11, close: 1.12 },
      { high: 1.14, low: 1.12, close: 1.13 },
    ]);
    expect(structure).toBe('HIGHER_HIGHS');
  });

  it('detects support and resistance levels with deduping', () => {
    const levels = detectSupportResistance([
      { high: 10, low: 9.8, close: 9.9 },
      { high: 10.1, low: 9.9, close: 10 },
      { high: 10.2, low: 10, close: 10.1 },
      { high: 10.1, low: 9.8, close: 9.9 },
      { high: 10.3, low: 10.1, close: 10.2 },
      { high: 10.3, low: 9.9, close: 10.1 },
    ]);
    expect(levels.supportLevels.length).toBeGreaterThan(0);
    expect(levels.resistanceLevels.length).toBeGreaterThan(0);
  });

  it('derives deterministic currency strength from available pair data', () => {
    const strength = deriveCurrencyStrength({
      EURUSD: 1.08,
      GBPUSD: 1.27,
      USDJPY: 148.1,
      USDCHF: 0.89,
      AUDUSD: 0.66,
      NZDUSD: 0.61,
    });
    expect(strength).toBeDefined();
    expect(strength.some((entry) => entry.currency === 'USD')).toBe(true);
  });

  it('creates an aggregated analysis state from candles', async () => {
    const service = new MarketIntelligenceService();
    const state = service.analyzeCandles({
      symbol: 'EURUSD',
      timeframe: MarketTimeframe.ONE_HOUR,
      candles,
      source: 'mock',
      dataStatus: 'ok',
    });
    expect(state.symbol).toBe('EURUSD');
    expect(state.indicators.rsi).toBeDefined();
    expect(state.trend).toBeTruthy();
    expect(state.marketStructure).toBeTruthy();
  });
});
