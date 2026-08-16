import { describe, it, expect } from 'vitest';
import {
  OperatingMode,
  TradingStyle,
  TradeDirection,
  TradeStatus,
  Environment,
  HealthStatus,
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
});
