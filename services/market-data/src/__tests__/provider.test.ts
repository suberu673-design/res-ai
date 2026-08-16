import { MarketTimeframe } from '@forex-platform/types';
import { describe, expect, it } from 'vitest';
import { MockForexProvider } from '../providers/mock-provider';

describe('MockForexProvider', () => {
  it('normalizes a quote payload', async () => {
    const provider = new MockForexProvider();
    const quote = await provider.getQuote('EURUSD');

    expect(quote.symbol).toBe('EUR/USD');
    expect(quote.bid).toBeGreaterThan(0);
    expect(quote.ask).toBeGreaterThan(quote.bid);
    expect(quote.spread).toBeGreaterThan(0);
    expect(quote.source).toBe('mock');
  });

  it('normalizes candles for a supported pair', async () => {
    const provider = new MockForexProvider();
    const candles = await provider.getHistoricalCandles('EURUSD', MarketTimeframe.FIFTEEN_MINUTES, 10);

    expect(candles.length).toBe(10);
    expect(candles[0].symbol).toBe('EUR/USD');
    expect(candles[0].timeframe).toBe('15m');
  });

  it('rejects unsupported symbols', async () => {
    const provider = new MockForexProvider();
    await expect(provider.getQuote('XYZ/ABC')).rejects.toThrow();
  });
});
