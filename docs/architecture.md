# AI Forex Trading Platform - Architecture

## Overview

The AI Forex Trading Platform is a modern, modular trading system designed for long-term scalability. The core M7 milestone is to establish the persistent lifecycle foundation that all future trading decisions and execution workflows will rely on.

**Core Principle:** The web application is a client of the backend. The core trading/AI systems must not depend on the web frontend.

## M7 — Trading Architecture Foundation

M7 provides the durable data contracts and lifecycle states needed for:

Market → Intelligence → Opportunity → AI Analysis → Trade Proposal → Risk Decision → Approval → Order → Position → Trade → Journal → Post-Trade Analysis

M7 intentionally implements:

- `TradeProposal` lifecycle persistence
- `RiskDecision` capture
- `StrategyVersion` metadata/versioning foundation
- `AIAnalysisHistory` persistence
- `JournalEvent` logging
- `ExecutionEvent` record structure
- order/position/trade lifecycle state tracking
- transition validation guards
- minimal lifecycle API routes

M7 intentionally does not implement:

- Strategy Engine logic
- strategy signal generation
- Risk Engine behavior
- broker execution or paper broker logic
- autonomous trading
- live execution flows
- strategy optimization or backtesting

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Web Application                          │
│                    (Next.js - Port 3000)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API Calls
┌──────────────────────▼──────────────────────────────────────┐
│                   API Gateway / Service                     │
│                    (Express - Port 3001)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
   ┌────────┐  ┌────────────┐  ┌──────────────┐
   │  Risk  │  │  Trading   │  │ Market Data  │
   │ Engine │  │   Engine   │  │  Service     │
   └────────┘  └────────────┘  └──────────────┘
       │               │               │
       │               │               │
   ┌──────────┐  ┌───────────┐  ┌────────────┐
   │Strategy  │  │AI Service │  │  Strategy  │
   │Engine    │  │           │  │  Engine    │
   └──────────┘  └───────────┘  └────────────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   PostgreSQL    │
              │   Database      │
              └─────────────────┘
```

## Repository Structure

### `/apps/web`

Next.js web application providing the user interface. This is a client-only application that consumes the backend API. Contains:

- Navigation and layout components
- Dashboard and monitoring views
- User settings
- Real-time status displays

**Important:** The web app has NO business logic. All trading decisions, market analysis, and risk calculations happen in backend services.

### `/services/api`

Express.js REST API server. Entry point for all client requests. Provides:

- Health checks
- Version information
- Routing to other services
- Request validation and authentication (future)

### `/services/market-data`

Market data aggregation and caching service. Responsibilities:

- Fetch real-time forex market data
- Cache and normalize data
- Provide market pair information
- Historical price retrieval

### `/services/trading`

This is intentionally not a live execution implementation during M7. The repository’s M7 foundation retains the contract layer for order, position, and trade lifecycle states without executing orders or broker interactions.

### `/services/strategy`

This repository does not implement the Strategy Engine in M7. `StrategyVersion` is a versioning metadata contract only. It does not generate signals, optimize, evaluate entries, or execute strategy logic.

### `/services/risk`

Risk management engine. Responsibilities:

- Position sizing calculations
- Portfolio risk assessment
- Drawdown monitoring
- Maximum loss enforcement
- Risk alerts

### `/services/ai`

AI decision-making service. Responsibilities:

- Market opportunity identification
- Technical analysis
- Macro analysis
- Trade thesis generation
- Decision logging

### `/services/backtesting`

Historical backtesting and strategy research. Responsibilities:

- Historical data simulation
- Strategy performance replay
- Walk-forward analysis
- Monte Carlo simulations
- Optimization

### `/packages/types`

Shared TypeScript types and enums. Single source of truth for:

- Operating modes
- Trading styles
- Trade status enums
- Business domain interfaces

Used by all services and the web application.

### `/packages/config`

Shared configuration utilities.

### `/packages/utils`

Shared utility functions and helpers.

### `/database`

Database schema and migrations using Prisma. Contains:

- `prisma/schema.prisma` - Data model definitions
- `seeds/seed.ts` - Development data seeding
- Migration scripts

### `/docs`

Project documentation:

- `architecture.md` - This file
- `development-rules.md` - Development guidelines

## Service Boundaries

### Frontend ↔ Backend Contract

The web application communicates with the API via REST endpoints:

- **No shared code** (except types)
- **No database access** from frontend
- **No business logic** in frontend
- **Types-only imports** from `@forex-platform/types`

### Backend Service Communication

Services communicate via:

- **Direct module imports** (same monorepo)
- **REST API calls** (for future microservices)
- **Shared database** (Postgres)
- **Shared types** from `@forex-platform/types`

## Database Schema

Core tables (simplified for D0):

- **users** - Platform users
- **trading_accounts** - User trading accounts (demo/live)
- **market_pairs** - Available forex pairs
- **strategies** - Trading strategies
- **trades** - Trade history
- **positions** - Open positions
- **orders** - Pending/executed orders
- **ai_events** - AI decision logging

See `/database/prisma/schema.prisma` for full schema.

## Key Architectural Decisions

1. **Monorepo**: All code in one repository for easier coordination during development. Can be split into microservices later.

2. **Shared Types Package**: Single source of truth for all enums and interfaces. Prevents inconsistency across services.

3. **Prisma ORM**: Type-safe database access with migrations.

4. **PostgreSQL**: Reliable relational database suitable for financial applications.

5. **No Real Trading Initially**: All trading is paper/demo only. Broker integration is a future step.

6. **Explicit AI Logging**: All AI decisions are logged and queryable for analysis and audit.

7. **REST API First**: Simple HTTP/JSON initially. WebSockets can be added for real-time updates.

## Future Enhancements

### M1 - Web Application Shell

- Complete dashboard UI
- Account management
- Basic position viewing
- Trade history display

### M2 - Market Data

- Real market data integration
- Market scanning
- Opportunity discovery

### M3 - Trading Engine

- Paper trading execution
- Order management
- Position tracking

### M4 - AI Services

- Technical analysis algorithms
- Trade thesis generation
- Opportunity ranking

### M5 - Risk Management

- Position sizing
- Portfolio risk calculation
- Risk alerting

### M6 - Backtesting

- Historical replay
- Strategy optimization
- Walk-forward validation

### M7 - Flutter Mobile App

- Mobile dashboard
- Same backend API consumption
- Push notifications

### M8 - Broker Integration

- Demo account connection
- Live account preparation
- (Eventual) live trading

## Environment Separation

```
DEVELOPMENT  → Local development with mock data
TEST         → Automated testing environment
PRODUCTION   → Live trading environment (future)
```

All environments use the same code and database schema, differentiated by environment variables and data.

## Error Handling & Observability

- All services log decision points
- AI events are queryable for audit
- Health checks for service dependencies
- Structured error responses

## Security Notes

- API authentication is placeholder (to be implemented)
- No real API keys in code (use `.env`)
- All trading logic is server-side
- Database runs with restricted user credentials
