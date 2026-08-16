import { MarketCandle, MarketPairDefinition, MarketQuote, MarketTimeframe } from '@forex-platform/types';
import { createMarketDataError, type MarketDataProvider } from '../types';

export class RealForexProvider implements MarketDataProvider {
  readonly mode = 'LIVE' as const;
  readonly providerName = 'live-provider';

  constructor(private readonly apiKey: string) {
    if (!apiKey || !apiKey.trim()) {
      throw createMarketDataError('MISSING_CREDENTIALS', { provider: 'real-provider' });
    }
  }

  async getQuote(pair: string): Promise<MarketQuote> {
    void pair;
    throw createMarketDataError('UNAVAILABLE_PROVIDER', { provider: this.providerName, message: 'Real provider not configured in this milestone.' });
  }

  async getHistoricalCandles(pair: string, timeframe: MarketTimeframe, limit: number): Promise<MarketCandle[]> {
    void pair;
    void timeframe;
    void limit;
    throw createMarketDataError('UNAVAILABLE_PROVIDER', { provider: this.providerName, message: 'Real provider not configured in this milestone.' });
  }

  async getSupportedPairs(): Promise<MarketPairDefinition[]> {
    throw createMarketDataError('UNAVAILABLE_PROVIDER', { provider: this.providerName, message: 'Real provider not configured in this milestone.' });
  }
}
