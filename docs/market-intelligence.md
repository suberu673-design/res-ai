# Market Intelligence (M3)

## Overview

This service sits directly below the market-data layer and converts normalized candles and quotes into deterministic market information. It does not make trading decisions, forecast entries, or produce AI-generated narratives. The output is a structured market state suitable for later AI consumption.

The pipeline is:

Market Data -> Indicators -> Market Structure -> Trend -> Momentum -> Volatility -> Support / Resistance -> Currency Strength -> Structured Market State

## Architecture

- `services/market-data` provides normalized candles and quotes through the provider abstraction.
- `packages/types` defines the shared enums and interfaces for trend, momentum, volatility, structure, support/resistance, and the final market state.
- `services/market-intelligence` calculates deterministic indicators and aggregates them.
- `services/api` exposes `/api/analysis/:symbol` for structured JSON responses.
- The web app consumes those results and shows status clearly when the market-data source is `MOCK`.

## Indicator formulas and implementation choices

### SMA

The simple moving average takes the last `n` closes and averages them. Values are considered valid only when the requested history length is available.

### EMA

The exponential moving average uses the standard multiplier:

$EMA_t = (close_t - EMA_{t-1}) \times \frac{2}{n + 1} + EMA_{t-1}$

The service only emits EMA values when enough historical data exists. Insufficient history returns `null` instead of a misleading value.

### RSI

Calculated using Wilder's smoothing approach with a default period of 14. Values are constrained to `[0, 100]` and `null` is returned when there is not enough data.

### MACD

The MACD uses the configured fast and slow EMAs, defaulted to 12 and 26. The signal line uses a configurable signal length, default 9. The service returns `null` when the input series does not contain enough history to compute the requested window.

### ATR

Average true range is computed from true range over the last 14 periods. It is normalized against price in the final aggregated market state for volatility classification.

### Bollinger Bands

The default configuration uses a 20-period moving average and ±2 standard deviations. The service returns `null` when the series is too short.

### ADX

The directional strength index uses a smoothed series of DX values and returns a single average directional index value for the configured period. Insufficient length yields `null`.

## Default parameters

- SMA: configurable
- EMA: periods 20, 50, 100, 200 supported by default
- RSI: period 14
- MACD: fast 12, slow 26, signal 9
- ATR: period 14
- Bollinger Bands: period 20, standard deviations 2
- ADX: period 14
- Market structure swing detection: range-based using recent candles
- Support/resistance: recent swing levels within the last 30 candles, deduplicated by tolerance

## Trend rules

The trend detector uses a deterministic combination of:

- price relative to EMA 20
- EMA 20 relative to EMA 50
- EMA 50 relative to EMA 200
- recent market structure summary

Rules:

- If price > EMA20 and EMA20 > EMA50 and EMA50 > EMA200, trend is `BULLISH`.
- If price < EMA20 and EMA20 < EMA50 and EMA50 < EMA200, trend is `BEARISH`.
- If the recent structure is flat and price remains near the moving average band, trend is `SIDEWAYS`.
- If there is not enough historical data or the signals conflict, the result is `UNKNOWN`.

## Momentum rules

Momentum uses RSI, MACD delta, and the rate of change. The project-defined rules are:

- `STRONG_BULLISH`: RSI >= 70 or RSI >= 60 and MACD delta > 0 and ROC > 1%
- `BULLISH`: RSI > 55 or MACD delta > 0 and ROC > 0
- `STRONG_BEARISH`: RSI <= 30 or RSI <= 40 and MACD delta < 0 and ROC < -1%
- `BEARISH`: RSI < 45 or MACD delta < 0 and ROC < 0
- otherwise `NEUTRAL`

These thresholds are intentionally simple and deterministic, not predictive.

## Volatility rules

Volatility is a project-defined classification using normalized ATR:

- `LOW`: < 0.0006
- `NORMAL`: 0.0006 to < 0.0012
- `HIGH`: 0.0012 to < 0.0025
- `EXTREME`: >= 0.0025

This is not universal market truth; it is a project classification intended for later AI context.

## Market-structure rules

The structure detector reads recent candles and looks for deterministic swing relationships:

- `HIGHER_HIGHS`: recent highs and lows continue to rise
- `LOWER_LOWS`: recent lows decline while highs decline
- `BREAKOUT`: latest close exceeds recent swing high after a momentum expansion
- `BREAKDOWN`: latest close breaks below recent swing low
- `RANGE`: recent high/low spread remains stable within a tolerance band
- otherwise `UNKNOWN`

No AI interpretation layer is added here; the classification is purely mechanical.

## Support/resistance rules

Support and resistance are built from recent local lows and highs aggregated in a low-resolution bucket. The detector then:

- groups nearby values within a tolerance band
- deduplicates them by price proximity
- sorts and returns the strongest recent zones

The first implementation is intentionally simple and explainable. It does not claim to predict future levels with certainty.

## Currency-strength calculation

Currency strength is derived deterministically from the supported pair universe. The service accumulates directional score contributions from the available pairs and then normalizes their output into a single perspective for each currency.

The implementation currently uses the supported pairs in the M2 universe and maps them to the base/quote currencies in the project-defined set:

- USD
- EUR
- GBP
- JPY
- CHF
- AUD
- CAD
- NZD

Missing pair data simply means the corresponding currency is left at its current aggregate score; the result remains deterministic and transparent.

## API endpoints

### GET /api/analysis/:symbol

Example:

`GET /api/analysis/EURUSD?timeframe=1h`

Returns a structured JSON object with:

- symbol
- timeframe
- timestamp
- trend
- momentum
- volatility
- marketStructure
- supportLevels
- resistanceLevels
- indicators
- currencyStrength (when available)
- source
- dataStatus

### Validation

The API validates:

- symbol exists and is supported
- timeframe is supported
- history length is sane and not excessive

When insufficient historical data exists, the response still returns a valid structure with `dataStatus: 'insufficient_data'` rather than invalid floats.

## Limitations

- This is an analytical classification layer, not a prediction engine.
- No trade direction, entry recommendation, or signal is produced here.
- The current support/resistance logic is intentionally simple.
- Currency strength is relative to the supported pair subset and can be incomplete when some pairs are unavailable.
- For `MOCK` mode, the source is clearly marked as mock and should not be presented as real market intelligence.

## Mock-data considerations

The market-data service may operate in `MOCK` mode. When it does, this service still calculates deterministic structures from the provided synthetic candles, but the UI and API must clearly expose the source and mode so the output is not mistaken for live market intelligence.
