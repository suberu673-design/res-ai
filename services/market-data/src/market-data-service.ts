import {
  MarketCandle,
  MarketPairDefinition,
  MarketQuote,
  MarketTimeframe,
} from '@forex-platform/types';
import { createMarketDataError, MarketDataProvider, MarketDataServiceConfig, normalizePairCode, normalizePairSymbol, SUPPORTED_TIMEFRAMES } from './types';

export class MarketDataService {
  private provider: MarketDataProvider;
  private readonly defaultTimeframe: MarketTimeframe;
  private cache = new Map<string, { expiresAt: number; value: unknown }>();

  constructor(config: MarketDataServiceConfig) {
    this.provider = config.provider;
    this.defaultTimeframe = config.defaultTimeframe ?? MarketTimeframe.FIFTEEN_MINUTES;
  }

  private getCacheKey(prefix: string, value: string): string {
    return `${prefix}:${value}`;
  }

  private isFresh(key: string): boolean {
    const cached = this.cache.get(key);
    return !!cached && cached.expiresAt > Date.now();
  }

  async getSupportedPairs(): Promise<MarketPairDefinition[]> {
    const key = this.getCacheKey('pairs', 'all');
    if (this.isFresh(key)) {
      return this.cache.get(key)?.value as MarketPairDefinition[];
    }

    const pairs = await this.provider.getSupportedPairs();
    this.cache.set(key, { expiresAt: Date.now() + 60_000, value: pairs });
    return pairs;
  }

  async getQuote(symbol: string): Promise<MarketQuote> {
    const normalized = normalizePairCode(symbol);
    const pairCode = normalized.toUpperCase();
    const key = this.getCacheKey('quote', pairCode);

    if (this.isFresh(key)) {
      return this.cache.get(key)?.value as MarketQuote;
    }

    const quote = await this.provider.getQuote(pairCode);
    this.cache.set(key, { expiresAt: Date.now() + 30_000, value: quote });
    return quote;
  }

  async getHistoricalCandles(symbol: string, timeframe: MarketTimeframe, limit = 200): Promise<MarketCandle[]> {
    if (!SUPPORTED_TIMEFRAMES.includes(timeframe)) {
      throw createMarketDataError('UNSUPPORTED_TIMEFRAME', { timeframe });
    }

    const normalized = normalizePairCode(symbol);
    const key = this.getCacheKey(`candles:${timeframe}`, normalized);

    if (this.isFresh(key)) {
      return this.cache.get(key)?.value as MarketCandle[];
    }

    const candles = await this.provider.getHistoricalCandles(normalized, timeframe, limit);
    this.cache.set(key, { expiresAt: Date.now() + 120_000, value: candles });
    return candles;
  }

  getDefaultTimeframe(): MarketTimeframe {
    return this.defaultTimeframe;
  }

  getProviderName(): string {
    return this.provider.providerName;
  }

  getProviderMode(): 'LIVE' | 'MOCK' {
    return this.provider.mode;
  }

  normalizeSymbolForDisplay(raw: string): string {
    return normalizePairSymbol(raw);
  }
}
