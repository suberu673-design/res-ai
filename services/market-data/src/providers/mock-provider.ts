import { MarketCandle, MarketPairDefinition, MarketQuote, MarketTimeframe } from '@forex-platform/types';
import { createMarketDataError, normalizePairCode, SUPPORTED_PAIRS, type MarketDataProvider } from '../types';

export class MockForexProvider implements MarketDataProvider {
  readonly mode = 'MOCK' as const;
  readonly providerName = 'mock';

  async getQuote(pair: string): Promise<MarketQuote> {
    const normalized = normalizePairCode(pair);
    const config = SUPPORTED_PAIRS[normalized];
    const seeded = this.seedFromSymbol(config.symbol);
    const bid = Number((seeded + (Math.random() * 0.0012)).toFixed(5));
    const ask = Number((bid + (Math.random() * 0.0008 + 0.0002)).toFixed(5));

    return {
      symbol: config.symbol,
      bid,
      ask,
      spread: Number((ask - bid).toFixed(5)),
      timestamp: new Date(),
      source: 'mock',
    };
  }

  async getHistoricalCandles(pair: string, timeframe: MarketTimeframe, limit: number): Promise<MarketCandle[]> {
    const normalized = normalizePairCode(pair);
    const config = SUPPORTED_PAIRS[normalized];
    const candles: MarketCandle[] = [];
    const now = Date.now();
    const stepMs = this.getStepMilliseconds(timeframe);
    let baseValue = this.seedFromSymbol(config.symbol);

    for (let index = 0; index < limit; index += 1) {
      const timestamp = new Date(now - (limit - index) * stepMs);
      const open = Number(baseValue.toFixed(5));
      const drift = (Math.random() - 0.5) * 0.003;
      const close = Number((open + drift).toFixed(5));
      const high = Number(Math.max(open, close) + Math.random() * 0.0022 + 0.0004);
      const low = Number(Math.min(open, close) - (Math.random() * 0.0022 + 0.0004));
      const candle: MarketCandle = {
        symbol: config.symbol,
        timeframe,
        timestamp,
        open,
        high: Number(high.toFixed(5)),
        low: Number(low.toFixed(5)),
        close: Number(close.toFixed(5)),
        volume: null,
        source: 'mock',
      };
      candles.push(candle);
      baseValue = close;
    }

    return candles;
  }

  async getSupportedPairs(): Promise<MarketPairDefinition[]> {
    return Object.values(SUPPORTED_PAIRS).map((pair) => ({
      symbol: pair.symbol,
      baseCurrency: pair.baseCurrency,
      quoteCurrency: pair.quoteCurrency,
    }));
  }

  private seedFromSymbol(symbol: string): number {
    const map: Record<string, number> = {
      'EUR/USD': 1.085,
      'GBP/USD': 1.275,
      'USD/JPY': 148.32,
      'USD/CHF': 0.9,
      'AUD/USD': 0.66,
      'USD/CAD': 1.36,
      'NZD/USD': 0.61,
      'EUR/GBP': 0.85,
      'EUR/JPY': 160.8,
      'GBP/JPY': 189.2,
    };

    if (!(symbol in map)) {
      throw createMarketDataError('INVALID_SYMBOL', { symbol });
    }
    return map[symbol];
  }

  private getStepMilliseconds(timeframe: MarketTimeframe): number {
    const map: Record<MarketTimeframe, number> = {
      '1m': 60_000,
      '5m': 5 * 60_000,
      '15m': 15 * 60_000,
      '30m': 30 * 60_000,
      '1h': 60 * 60_000,
      '4h': 4 * 60 * 60_000,
      '1d': 24 * 60 * 60_000,
    };
    return map[timeframe] ?? map['15m'];
  }
}
