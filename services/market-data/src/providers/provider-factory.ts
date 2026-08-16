import { MarketDataProvider, ProviderMode } from '../types';
import { MockForexProvider } from './mock-provider';
import { RealForexProvider } from './real-provider';

export function createMarketDataProvider(mode: ProviderMode = 'MOCK', apiKey?: string): MarketDataProvider {
  switch (mode) {
    case 'LIVE':
      if (!apiKey || !apiKey.trim()) {
        return new MockForexProvider();
      }
      return new RealForexProvider(apiKey);
    case 'MOCK':
    default:
      return new MockForexProvider();
  }
}
