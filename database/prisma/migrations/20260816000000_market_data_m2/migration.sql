ALTER TABLE "market_pairs"
  ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS "market_candles" (
  "id" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "timeframe" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL,
  "open" DOUBLE PRECISION NOT NULL,
  "high" DOUBLE PRECISION NOT NULL,
  "low" DOUBLE PRECISION NOT NULL,
  "close" DOUBLE PRECISION NOT NULL,
  "volume" DOUBLE PRECISION,
  "source" TEXT NOT NULL DEFAULT 'mock',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "market_candles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "market_candles_symbol_timeframe_timestamp_key"
  ON "market_candles" ("symbol", "timeframe", "timestamp");

CREATE INDEX IF NOT EXISTS "market_candles_symbol_timeframe_timestamp_idx"
  ON "market_candles" ("symbol", "timeframe", "timestamp");
