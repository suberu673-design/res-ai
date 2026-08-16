import { MarketCandle, MarketPairDefinition, MarketQuote, MarketTimeframe } from '@forex-platform/types';

export type SupportedPairSymbol = 'EURUSD' | 'GBPUSD' | 'USDJPY' | 'USDCHF' | 'AUDUSD' | 'USDCAD' | 'NZDUSD' | 'EURGBP' | 'EURJPY' | 'GBPJPY';

export type ProviderMode = 'LIVE' | 'MOCK';

export interface ProviderQuoteResponse {
  symbol: string;
  bid: number;
  ask: number;
  timestamp: string | Date;
  source?: string;
}

export interface ProviderCandleResponse {
  symbol: string;
  timeframe: string;
  timestamp: string | Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number | null;
  source?: string;
}

export interface MarketDataProvider {
  readonly mode: ProviderMode;
  readonly providerName: string;
  getQuote(pair: string): Promise<MarketQuote>;
  getHistoricalCandles(pair: string, timeframe: MarketTimeframe, limit: number): Promise<MarketCandle[]>;
  getSupportedPairs(): Promise<MarketPairDefinition[]>;
}

export interface MarketDataServiceConfig {
  provider: MarketDataProvider;
  defaultTimeframe?: MarketTimeframe;
}

export interface MarketDataError extends Error {
  code: 'INVALID_SYMBOL' | 'UNSUPPORTED_TIMEFRAME' | 'MALFORMED_RESPONSE' | 'PROVIDER_ERROR' | 'RATE_LIMITED' | 'MISSING_CREDENTIALS' | 'UNAVAILABLE_PROVIDER' | 'DATABASE_ERROR';
  details?: Record<string, unknown>;
}

export const SUPPORTED_PAIRS: Record<SupportedPairSymbol, { symbol: string; baseCurrency: string; quoteCurrency: string }> = {
  EURUSD: { symbol: 'EUR/USD', baseCurrency: 'EUR', quoteCurrency: 'USD' },
  GBPUSD: { symbol: 'GBP/USD', baseCurrency: 'GBP', quoteCurrency: 'USD' },
  USDJPY: { symbol: 'USD/JPY', baseCurrency: 'USD', quoteCurrency: 'JPY' },
  USDCHF: { symbol: 'USD/CHF', baseCurrency: 'USD', quoteCurrency: 'CHF' },
  AUDUSD: { symbol: 'AUD/USD', baseCurrency: 'AUD', quoteCurrency: 'USD' },
  USDCAD: { symbol: 'USD/CAD', baseCurrency: 'USD', quoteCurrency: 'CAD' },
  NZDUSD: { symbol: 'NZD/USD', baseCurrency: 'NZD', quoteCurrency: 'USD' },
  EURGBP: { symbol: 'EUR/GBP', baseCurrency: 'EUR', quoteCurrency: 'GBP' },
  EURJPY: { symbol: 'EUR/JPY', baseCurrency: 'EUR', quoteCurrency: 'JPY' },
  GBPJPY: { symbol: 'GBP/JPY', baseCurrency: 'GBP', quoteCurrency: 'JPY' },
};

export const SUPPORTED_TIMEFRAMES: MarketTimeframe[] = [
  MarketTimeframe.ONE_MINUTE,
  MarketTimeframe.FIVE_MINUTES,
  MarketTimeframe.FIFTEEN_MINUTES,
  MarketTimeframe.THIRTY_MINUTES,
  MarketTimeframe.ONE_HOUR,
  MarketTimeframe.FOUR_HOURS,
  MarketTimeframe.ONE_DAY,
];

export function normalizePairSymbol(input: string): string {
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, '');
  const direct = cleaned.replace('/', '');
  const normalized = direct.includes('USD') ? direct : direct;
  const key = normalized as SupportedPairSymbol;
  if (!(key in SUPPORTED_PAIRS)) {
    throw createMarketDataError('INVALID_SYMBOL', { symbol: input });
  }
  return SUPPORTED_PAIRS[key].symbol;
}

export function normalizePairCode(input: string): SupportedPairSymbol {
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, '');
  const value = cleaned.replace('/', '');
  const candidate = value as SupportedPairSymbol;
  if (!(candidate in SUPPORTED_PAIRS)) {
    throw createMarketDataError('INVALID_SYMBOL', { symbol: input });
  }
  return candidate;
}

export function isValidTimeframe(value: string): value is MarketTimeframe {
  return (SUPPORTED_TIMEFRAMES as string[]).includes(value);
}

export function createMarketDataError(code: MarketDataError['code'], details?: Record<string, unknown>): MarketDataError {
  const error = new Error(code) as MarketDataError;
  error.code = code;
  error.details = details;
  return error;
}
