# Market Data Service (M2)

## Overview

The market data layer is isolated behind a provider abstraction so the application does not depend directly on a third-party vendor. The web app calls the API, the API calls the market-data service, and the market-data service adapts to the configured provider.

## Provider abstraction

The service exposes a provider interface with operations to fetch:

- supported pairs
- a current quote
- historical candles

The adapter layer normalizes all provider responses into the shared types package contracts.

## Current development provider

The default development provider is a mock provider. It is explicitly marked as `MOCK` and is intended for local development only. It never presents itself as real market data to users.

When credentials are provided later, a real provider adapter can replace the mock provider without altering the rest of the application.

## Required environment variables

```env
MARKET_DATA_PROVIDER=mock
MARKET_DATA_API_KEY=
MARKET_DATA_MODE=mock
```

The app must never commit secrets or live credentials.

## Supported pairs

The initial supported universe is:

- EUR/USD
- GBP/USD
- USD/JPY
- USD/CHF
- AUD/USD
- USD/CAD
- NZD/USD
- EUR/GBP
- EUR/JPY
- GBP/JPY

These are configured in the market-data service and are not duplicated across UI components.

## Supported timeframes

- 1m
- 5m
- 15m
- 30m
- 1h
- 4h
- 1d

## API endpoints

- `GET /api/market/pairs`
- `GET /api/market/quote/:symbol`
- `GET /api/market/candles/:symbol?timeframe=15m&limit=200`

## Database storage

The Prisma schema includes a `MarketPair` record and a `MarketCandle` table with indexes for symbol, timeframe, and timestamp. Candle inserts are designed to avoid duplicates by using a compound unique index.

## Mock provider behavior

The mock provider emits clearly labeled synthetic values with `source: 'mock'` and `mode: 'MOCK'`. It is enabled by default and should be visually identified as mock in the UI.

## Rate-limit and replacement considerations

Real provider integrations should respect API rate limits, token usage, and timeout configuration. The adapter boundary makes it easy to replace the provider later without rewriting the API or dashboard.

## Future provider replacement

A new provider only needs to implement the provider interface and normalization layer; the rest of the application continues to call the same market-data service contract.
