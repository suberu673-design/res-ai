import { describe, expect, it } from 'vitest';
import {
  MarketTrend,
  MomentumStrength,
  TradingMode,
  VolatilityRegime,
} from '@forex-platform/types';
import {
  buildOpportunityFromMarketState,
  defaultOpportunityFilters,
  scenarioScore,
} from './index';

describe('Opportunity engine', () => {
  it('should score a bullish, high-momentum setup as actionable', () => {
    const opportunity = buildOpportunityFromMarketState({
      symbol: 'EURUSD',
      timeframe: '1h',
      trend: MarketTrend.BULLISH,
      momentum: MomentumStrength.STRONG_BULLISH,
      volatility: VolatilityRegime.NORMAL,
      marketStructure: 'BREAKOUT' as never,
      supportLevels: [],
      resistanceLevels: [],
      indicators: {
        rsi: 72,
        ema20: 1.09,
        ema50: 1.07,
        ema100: 1.05,
        ema200: 1.03,
        macd: 0.0015,
        signal: 0.0008,
        histogram: 0.0007,
        atr: 0.0009,
        adx: 30,
        roc: 0.8,
        bollingerBands: null,
        valid: true,
        dataStatus: 'ok',
        source: 'mock',
      },
      source: 'mock',
      dataStatus: 'ok',
      currencyStrength: [],
    }, TradingMode.SHORT_TERM);

    expect(opportunity.direction).toBe('LONG');
    expect(opportunity.score).toBeGreaterThan(70);
    expect(opportunity.confidence).toBeGreaterThan(60);
    expect(opportunity.reasons.length).toBeGreaterThan(0);
    expect(opportunity.riskFlags.length).toBeGreaterThanOrEqual(0);
  });

  it('should filter out low-quality market states', () => {
    const score = scenarioScore({
      trend: MarketTrend.UNKNOWN,
      momentum: MomentumStrength.NEUTRAL,
      volatility: VolatilityRegime.LOW,
      marketStructure: 'UNKNOWN' as never,
      supportLevels: [],
      resistanceLevels: [],
      onlyValidData: true,
    });

    expect(score).toBeLessThan(defaultOpportunityFilters.minimumScore);
  });
});
