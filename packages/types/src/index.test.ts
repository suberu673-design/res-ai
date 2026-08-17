import { describe, it, expect } from 'vitest';
import {
  Environment,
  HealthStatus,
  MarketTrend,
  MomentumStrength,
  OperatingMode,
  TradeDirection,
  TradeStatus,
  TradingMode,
  TradingStyle,
  buildTradingContext,
  getTradingModeConfiguration,
  isModeCompatibleWithMarketState,
  isTimeframeCompatible,
  isValidAIAnalysisTransition,
  isValidOrderTransition,
  isValidPositionTransition,
  isValidRiskDecisionTransition,
  isValidTradeProposalTransition,
  isValidTradeTransition,
  validateModeContext,
} from './index';

describe('Shared Types', () => {
  describe('Enums', () => {
    it('should have all operating modes', () => {
      expect(OperatingMode.SCOUT).toBe('SCOUT');
      expect(OperatingMode.ANALYST).toBe('ANALYST');
      expect(OperatingMode.AUTONOMOUS_PAPER).toBe('AUTONOMOUS_PAPER');
      expect(OperatingMode.HUMAN_APPROVAL).toBe('HUMAN_APPROVAL');
      expect(OperatingMode.LIVE_AUTONOMOUS).toBe('LIVE_AUTONOMOUS');
    });

    it('should have all trading styles', () => {
      expect(TradingStyle.SCALPING).toBe('SCALPING');
      expect(TradingStyle.INTRADAY).toBe('INTRADAY');
      expect(TradingStyle.SHORT_TERM).toBe('SHORT_TERM');
      expect(TradingStyle.SWING).toBe('SWING');
      expect(TradingStyle.POSITION).toBe('POSITION');
    });

    it('should have all trading modes', () => {
      expect(TradingMode.SCALPING).toBe('SCALPING');
      expect(TradingMode.INTRADAY).toBe('INTRADAY');
      expect(TradingMode.SHORT_TERM).toBe('SHORT_TERM');
      expect(TradingMode.SWING).toBe('SWING');
      expect(TradingMode.POSITION).toBe('POSITION');
    });

    it('should have all trade directions', () => {
      expect(TradeDirection.LONG).toBe('LONG');
      expect(TradeDirection.SHORT).toBe('SHORT');
    });

    it('should have all trade statuses', () => {
      expect(TradeStatus.PROPOSED).toBe('PROPOSED');
      expect(TradeStatus.OPEN).toBe('OPEN');
      expect(TradeStatus.CLOSED).toBe('CLOSED');
      expect(TradeStatus.CANCELLED).toBe('CANCELLED');
      expect(TradeStatus.REJECTED).toBe('REJECTED');
    });

    it('should have all environments', () => {
      expect(Environment.DEVELOPMENT).toBe('DEVELOPMENT');
      expect(Environment.TEST).toBe('TEST');
      expect(Environment.PRODUCTION).toBe('PRODUCTION');
    });
  });

  describe('Interfaces', () => {
    it('should allow creating health status', () => {
      const status: HealthStatus = {
        status: 'healthy',
        timestamp: new Date(),
        database: {
          status: 'connected',
          latency: 5,
        },
      };

      expect(status.status).toBe('healthy');
      expect(status.database?.status).toBe('connected');
    });
  });

  describe('Trading mode configuration', () => {
    it('should expose valid mode configuration for each mode', () => {
      Object.values(TradingMode).forEach((mode) => {
        const config = getTradingModeConfiguration(mode);
        expect(config.name).toBe(mode);
        expect(config.primaryTimeframes.length).toBeGreaterThan(0);
        expect(config.analysisPriorities.length).toBeGreaterThan(0);
      });
    });

    it('should validate timeframe compatibility deterministically', () => {
      expect(isTimeframeCompatible(TradingMode.SCALPING, '1m')).toBe(true);
      expect(isTimeframeCompatible(TradingMode.SCALPING, '5m')).toBe(true);
      expect(isTimeframeCompatible(TradingMode.SCALPING, '1d')).toBe(false);
      expect(isTimeframeCompatible(TradingMode.POSITION, '1d')).toBe(true);
      expect(isTimeframeCompatible(TradingMode.POSITION, '1w')).toBe(true);
      expect(isTimeframeCompatible(TradingMode.POSITION, '1m')).toBe(false);
    });
  });

  describe('Trading mode context', () => {
    it('should create context with expected priorities', () => {
      const context = buildTradingContext({
        symbol: 'EURUSD',
        mode: TradingMode.SWING,
        timeframe: '4h',
        marketState: {
          symbol: 'EURUSD',
          timeframe: '4h',
          timestamp: new Date(),
          trend: MarketTrend.BULLISH,
          momentum: MomentumStrength.BULLISH,
          volatility: 'NORMAL' as never,
          marketStructure: 'HIGHER_HIGHS' as never,
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
      });

      expect(context.prioritySet).toContain('trend');
      expect(context.prioritySet).toContain('marketStructure');
      expect(context.prioritySet).toContain('supportResistance');
      expect(context.prioritySet).toContain('volatility');
    });

    it('should validate valid and invalid contexts', () => {
      const valid = validateModeContext({
        symbol: 'EURUSD',
        selectedMode: TradingMode.SCALPING,
        currentTimeframe: '5m',
        marketState: {
          symbol: 'EURUSD',
          timeframe: '5m',
          timestamp: new Date(),
          trend: MarketTrend.BULLISH,
          momentum: MomentumStrength.STRONG_BULLISH,
          volatility: 'HIGH' as never,
          marketStructure: 'BREAKOUT' as never,
          supportLevels: [],
          resistanceLevels: [],
          indicators: {
            rsi: 72,
            ema20: 1.09,
            ema50: 1.07,
            ema100: 1.06,
            ema200: 1.04,
            macd: 0.002,
            signal: 0.001,
            histogram: 0.001,
            atr: 0.0015,
            adx: 32,
            roc: 1.1,
            bollingerBands: null,
            valid: true,
            dataStatus: 'ok',
            source: 'mock',
          },
          source: 'mock',
          dataStatus: 'ok',
        },
      });

      expect(valid.valid).toBe(true);

      const invalid = validateModeContext({
        symbol: 'EURUSD',
        selectedMode: TradingMode.POSITION,
        currentTimeframe: '1m',
        marketState: {
          symbol: 'EURUSD',
          timeframe: '1m',
          timestamp: new Date(),
          trend: MarketTrend.UNKNOWN,
          momentum: MomentumStrength.NEUTRAL,
          volatility: 'NORMAL' as never,
          marketStructure: 'UNKNOWN' as never,
          supportLevels: [],
          resistanceLevels: [],
          indicators: {
            rsi: null,
            ema20: null,
            ema50: null,
            ema100: null,
            ema200: null,
            macd: null,
            signal: null,
            histogram: null,
            atr: null,
            adx: null,
            roc: null,
            bollingerBands: null,
            valid: false,
            dataStatus: 'insufficient_data',
            source: 'mock',
          },
          source: 'mock',
          dataStatus: 'insufficient_data',
        },
      });

      expect(invalid.valid).toBe(false);
      expect(invalid.errors.length).toBeGreaterThan(0);
    });

    it('should reject missing or incompatible market state', () => {
      expect(isModeCompatibleWithMarketState(TradingMode.SCALPING, null)).toBe(
        false
      );
      expect(
        isModeCompatibleWithMarketState(TradingMode.POSITION, {
          dataStatus: 'no_data',
        } as never)
      ).toBe(false);
    });
  });

  describe('M7 lifecycle state machines', () => {
    it('should allow valid M7 proposal transitions and reject invalid ones', () => {
      expect(isValidTradeProposalTransition('DRAFT', 'ANALYZED')).toBe(true);
      expect(isValidTradeProposalTransition('ANALYZED', 'RISK_PENDING')).toBe(
        true
      );
      expect(isValidTradeProposalTransition('RISK_PENDING', 'APPROVED')).toBe(
        true
      );
      expect(isValidTradeProposalTransition('DRAFT', 'APPROVED')).toBe(false);
    });

    it('should allow valid risk and order transitions and reject invalid ones', () => {
      expect(isValidRiskDecisionTransition('PENDING', 'PASS')).toBe(true);
      expect(isValidRiskDecisionTransition('PENDING', 'FAIL')).toBe(true);
      expect(isValidRiskDecisionTransition('PASS', 'PENDING')).toBe(false);
      expect(isValidOrderTransition('PENDING', 'SUBMITTED')).toBe(true);
      expect(isValidOrderTransition('SUBMITTED', 'FILLED')).toBe(true);
      expect(isValidOrderTransition('PENDING', 'FILLED')).toBe(false);
    });

    it('should allow valid trade and position transitions and reject invalid ones', () => {
      expect(isValidTradeTransition('PROPOSED', 'OPEN')).toBe(true);
      expect(isValidTradeTransition('OPEN', 'CLOSED')).toBe(true);
      expect(isValidTradeTransition('CLOSED', 'OPEN')).toBe(false);
      expect(isValidPositionTransition('OPEN', 'PARTIALLY_CLOSED')).toBe(true);
      expect(isValidPositionTransition('OPEN', 'LIQUIDATED')).toBe(true);
      expect(isValidPositionTransition('LIQUIDATED', 'OPEN')).toBe(false);
      expect(isValidAIAnalysisTransition('DRAFT', 'ANALYZED')).toBe(true);
      expect(isValidAIAnalysisTransition('ANALYZED', 'ARCHIVED')).toBe(true);
      expect(isValidAIAnalysisTransition('ARCHIVED', 'DRAFT')).toBe(false);
    });
  });
});
