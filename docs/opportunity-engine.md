# M5 — Opportunity Discovery Engine

This milestone adds a structured opportunity-discovery layer on top of the already-complete market-data and market-intelligence services.

## Scope

- Use the existing deterministic market intelligence outputs
- Evaluate each market state with transparent scoring rules
- Keep the output suitable for later AI consumption
- Do not execute trades, place orders, or make autonomous decisions

## Flow

Market Data -> Market Intelligence -> Opportunity Discovery -> Radar / API Output

## Deterministic Scoring

The opportunity engine scores a market state with a weighted model:

- trend signals
- momentum strength
- volatility regime
- market structure quality
- recent support/resistance strength
- validity of enough data

The engine produces:

- symbol
- timeframe
- direction
- score
- confidence
- reasons
- risk flags
- explanation payload

## API Contract

The API now exposes these endpoints:

- GET /api/opportunities?mode=SWING&timeframe=4h
- GET /api/opportunities/:symbol?mode=SWING&timeframe=4h
- GET /api/scanner?mode=SWING&timeframe=4h

They return deterministic opportunity records derived from M3 market states and M4 trading-mode constraints.

## UI

The radar page shows a mode-aware opportunity scan and lists ranked opportunities with reasons and risk flags.

## Important Guardrails

- No actual order routing
- No broker integration
- No execution logic
- No live-trade assumptions
- No AI certainty claims
