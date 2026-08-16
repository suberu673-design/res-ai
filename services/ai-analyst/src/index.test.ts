import { describe, it, expect } from 'vitest';
import {
  MockAIProvider,
  AIAnalystService,
  validateAIAnalysis,
  buildMarketAnalysisPrompt,
} from './index';
import {
  AIAssessment,
  AIAnalysisContext,
  MarketTrend,
  MomentumStrength,
  TradingMode,
  VolatilityRegime,
} from '@forex-platform/types';

describe('AI Analyst Service', () => {
  describe('MockAIProvider', () => {
    it('should generate deterministic analysis for favorable setup', async () => {
      const provider = new MockAIProvider();
      const analysis = await provider.analyze({
        symbol: 'EURUSD',
        tradingMode: TradingMode.SHORT_TERM,
        timeframe: '1h',
        currentPrice: 1.085,
        marketState: {
          symbol: 'EURUSD',
          timeframe: '1h',
          timestamp: new Date(),
          trend: MarketTrend.BULLISH,
          momentum: MomentumStrength.STRONG_BULLISH,
          volatility: VolatilityRegime.NORMAL,
          marketStructure: 'BREAKOUT' as never,
          supportLevels: [
            {
              price: 1.082,
              type: 'SUPPORT' as never,
              strength: 0.8,
              source: 'swing',
            },
          ],
          resistanceLevels: [
            {
              price: 1.088,
              type: 'RESISTANCE' as never,
              strength: 0.7,
              source: 'swing',
            },
          ],
          indicators: {
            rsi: 72,
            ema20: 1.084,
            ema50: 1.08,
            ema100: 1.075,
            ema200: 1.07,
            macd: 0.001,
            signal: 0.0008,
            histogram: 0.0002,
            atr: 0.0008,
            adx: 28,
            roc: 0.6,
            bollingerBands: null,
            valid: true,
            dataStatus: 'ok',
            source: 'mock',
          },
          source: 'mock',
          dataStatus: 'ok',
        },
        opportunity: {
          direction: 'LONG',
          score: 85,
          confidence: 78,
          reasons: ['Bullish trend', 'Strong momentum', 'Support holding'],
          riskFlags: [],
        },
        marketDataSource: 'mock',
        marketDataMode: 'MOCK',
      });

      expect(analysis.symbol).toBe('EURUSD');
      expect(analysis.assessment).toBe(AIAssessment.FAVORABLE);
      expect(analysis.confidence).toBeGreaterThan(70);
      expect(analysis.direction).toBe('LONG');
      expect(analysis.summary.length).toBeGreaterThan(0);
      expect(analysis.reasons.length).toBeGreaterThan(0);
      expect(analysis.provider).toBe('mock');
      expect(analysis.marketDataMode).toBe('MOCK');
    });

    it('should generate cautious analysis for mixed setup', async () => {
      const provider = new MockAIProvider();
      const analysis = await provider.analyze({
        symbol: 'GBPUSD',
        tradingMode: TradingMode.INTRADAY,
        timeframe: '15m',
        currentPrice: 1.285,
        marketState: {
          symbol: 'GBPUSD',
          timeframe: '15m',
          timestamp: new Date(),
          trend: MarketTrend.SIDEWAYS,
          momentum: MomentumStrength.NEUTRAL,
          volatility: VolatilityRegime.NORMAL,
          marketStructure: 'RANGE' as never,
          supportLevels: [],
          resistanceLevels: [],
          indicators: {
            rsi: 52,
            ema20: 1.2845,
            ema50: 1.285,
            ema100: null,
            ema200: null,
            macd: 0.0001,
            signal: 0.00005,
            histogram: 0.00005,
            atr: 0.0005,
            adx: 15,
            roc: 0.1,
            bollingerBands: null,
            valid: false,
            dataStatus: 'insufficient_data',
            source: 'mock',
          },
          source: 'mock',
          dataStatus: 'insufficient_data',
        },
        opportunity: {
          direction: 'SHORT',
          score: 65,
          confidence: 55,
          reasons: ['Mixed signal'],
          riskFlags: ['Low liquidity', 'Unclear direction'],
        },
        marketDataSource: 'mock',
        marketDataMode: 'MOCK',
      });

      expect(analysis.assessment).toBe(AIAssessment.CAUTIOUS);
      expect(analysis.confidence).toBeLessThan(80);
    });

    it('should generate unfavorable analysis for poor setup', async () => {
      const provider = new MockAIProvider();
      const analysis = await provider.analyze({
        symbol: 'USDJPY',
        tradingMode: TradingMode.SCALPING,
        timeframe: '1m',
        currentPrice: 148.5,
        marketState: null,
        opportunity: {
          direction: 'LONG',
          score: 35,
          confidence: 25,
          reasons: [],
          riskFlags: [
            'No clear trend',
            'Insufficient data',
            'Extreme volatility',
          ],
        },
        marketDataSource: 'mock',
        marketDataMode: 'MOCK',
      });

      expect(analysis.assessment).toBe(AIAssessment.UNFAVORABLE);
    });
  });

  describe('AIAnalystService', () => {
    it('should use mock provider by default', async () => {
      const service = new AIAnalystService();
      expect(service.getProviderName()).toBe('mock');
      expect(service.getModelName()).toBe('mock-analyst-v1');
    });

    it('should analyze a market opportunity', async () => {
      const service = new AIAnalystService();
      const analysis = await service.analyze({
        symbol: 'EURUSD',
        tradingMode: TradingMode.SWING,
        timeframe: '4h',
        currentPrice: 1.085,
        marketState: {
          symbol: 'EURUSD',
          timeframe: '4h',
          timestamp: new Date(),
          trend: MarketTrend.BULLISH,
          momentum: MomentumStrength.BULLISH,
          volatility: VolatilityRegime.NORMAL,
          marketStructure: 'HIGHER_HIGHS' as never,
          supportLevels: [],
          resistanceLevels: [],
          indicators: {
            rsi: 65,
            ema20: 1.084,
            ema50: 1.08,
            ema100: 1.075,
            ema200: 1.07,
            macd: 0.0008,
            signal: 0.0006,
            histogram: 0.0002,
            atr: 0.0009,
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
        opportunity: {
          direction: 'LONG',
          score: 75,
          confidence: 70,
          reasons: ['Bullish structure', 'Positive momentum'],
          riskFlags: [],
        },
        marketDataSource: 'mock',
        marketDataMode: 'MOCK',
      });

      expect(analysis.id).toBeDefined();
      expect(analysis.symbol).toBe('EURUSD');
      expect(analysis.assessment).toBeDefined();
      expect(analysis.confidence).toBeGreaterThanOrEqual(0);
      expect(analysis.confidence).toBeLessThanOrEqual(100);
    });

    it('should throw on missing context fields', async () => {
      const service = new AIAnalystService();
      const incompleteContext: unknown = {
        symbol: 'EURUSD',
        tradingMode: TradingMode.SHORT_TERM,
        // missing timeframe and opportunity
      };

      await expect(service.analyze(incompleteContext as AIAnalysisContext)).rejects.toThrow();
    });
  });

  describe('Validation', () => {
    it('should validate a correct analysis response', () => {
      const validAnalysis = {
        symbol: 'EURUSD',
        direction: 'LONG',
        assessment: 'FAVORABLE',
        confidence: 75,
        summary: 'The setup is favorable',
        reasons: ['Trend is up'],
        risks: ['Resistance nearby'],
        invalidationConditions: ['Break below support'],
      };

      const result = validateAIAnalysis(validAnalysis);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject analysis with missing required fields', () => {
      const invalidAnalysis = {
        symbol: 'EURUSD',
        assessment: 'FAVORABLE',
        // missing direction, confidence, summary, reasons, risks, invalidationConditions
      };

      const result = validateAIAnalysis(invalidAnalysis);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid assessment values', () => {
      const invalidAnalysis = {
        symbol: 'EURUSD',
        direction: 'LONG',
        assessment: 'INVALID_ASSESSMENT',
        confidence: 75,
        summary: 'Test',
        reasons: [],
        risks: [],
        invalidationConditions: [],
      };

      const result = validateAIAnalysis(invalidAnalysis);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('assessment'))).toBe(true);
    });

    it('should reject invalid confidence values', () => {
      const invalidAnalysis = {
        symbol: 'EURUSD',
        direction: 'LONG',
        assessment: 'FAVORABLE',
        confidence: 150, // Invalid: > 100
        summary: 'Test',
        reasons: [],
        risks: [],
        invalidationConditions: [],
      };

      const result = validateAIAnalysis(invalidAnalysis);
      expect(result.valid).toBe(false);
    });
  });

  describe('Prompt building', () => {
    it('should build a market analysis prompt', () => {
      const context = {
        symbol: 'EURUSD',
        tradingMode: TradingMode.SHORT_TERM,
        timeframe: '1h',
        currentPrice: 1.085,
        marketState: null,
        opportunity: {
          direction: 'LONG',
          score: 75,
          confidence: 70,
          reasons: ['Bullish structure'],
          riskFlags: [],
        },
        marketDataSource: 'mock',
        marketDataMode: 'MOCK' as const,
      };

      const prompt = buildMarketAnalysisPrompt(context);
      expect(prompt).toContain('forex market analyst');
      expect(prompt).toContain('EURUSD');
      expect(prompt.toUpperCase()).toContain('JSON');
      expect(prompt).toContain('FAVORABLE');
      expect(prompt.toUpperCase()).toContain('DO NOT');
    });
  });
});
