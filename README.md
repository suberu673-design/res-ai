# AI Forex Trading Platform

An intelligent, modular forex trading platform built with TypeScript, Next.js, and Node.js.

## 🎯 Project Vision

The AI Forex Platform is designed to:

- **Scan** forex markets continuously for opportunities
- **Analyze** technical and macro conditions
- **Discover** trading opportunities across multiple timeframes
- **Persist** the lifecycle contracts required for proposal, approval, order, position, trade, and journal tracking
- **Log** every AI decision for auditability
- **Prepare** the platform for later execution and strategy automation without implementing them in M7

## 📦 Current Milestone: M7 — Trading Architecture Foundation

M7 creates the durable contracts required for:

Market → Intelligence → Opportunity → AI Analysis → Trade Proposal → Risk Decision → Approval → Order → Position → Trade → Journal → Post-Trade Analysis

### M7 implements

- lifecycle contracts and state machines
- persisted AI analysis history
- trade proposal persistence
- risk decision records
- strategy version metadata
- journal and execution event records
- minimal lifecycle API endpoints
- validation guards for valid/invalid transitions

### M7 does not implement

- Strategy Engine
- strategy signal generation
- Risk Engine logic
- Paper Broker
- broker execution
- autonomous trading
- live trading
- backtesting
- strategy optimization

## 📦 Architecture Scope

### Current Capabilities

- ✅ Clean monorepo structure (apps, services, packages)
- ✅ Shared TypeScript types package with trading domain enums
- ✅ PostgreSQL database with Prisma ORM
- ✅ Minimal Express.js API with health checks
- ✅ Responsive dark-first dashboard shell and navigation
- ✅ Demo AI opportunity, activity, and positions views
- ✅ Backend connectivity check for the health endpoint
- ✅ Docker Compose for development database
- ✅ Comprehensive development documentation

### Current M2 Capabilities

- ✅ Provider-based abstractions for market data access
- ✅ Shared market-data types for pairs, quotes, candles, and timeframes
- ✅ Mock market-data provider for local safe development
- ✅ Market-data endpoints in the API
- ✅ Provider status signal in the web shell
- ✅ Database schema support for candle storage
- ✅ Documentation for the market-data layer

### Upcoming Milestones

- M7 — Trading Architecture Foundation (current milestone)
- M8 — Strategy/Execution Expansion (not implemented in this branch)
- M9+ — Advanced execution, strategy engine, and broker integration work (future)

## 🏗️ Repository Structure

```
/
├── apps/
│   └── web/                 # Next.js web application
├── services/
│   ├── api/                 # Main REST API (Express.js)
│   ├── market-data/         # Market data aggregation (future)
│   ├── trading/             # Trading engine (future)
│   ├── ai/                  # AI services (future)
│   ├── strategy/            # Strategy management (future)
│   ├── risk/                # Risk engine (future)
│   └── backtesting/         # Backtesting (future)
├── packages/
│   ├── types/               # Shared TypeScript types
│   ├── config/              # Shared configuration (future)
│   └── utils/               # Shared utilities (future)
├── database/
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── seeds/
│       └── seed.ts          # Development data
├── docs/
│   ├── architecture.md      # System architecture
│   └── development-rules.md # Development guidelines
├── docker-compose.yml       # PostgreSQL for development
├── .env.example             # Environment template
├── .env                     # Local environment (gitignored)
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([install](https://nodejs.org/))
- **Docker** and **Docker Compose** ([install Docker Desktop](https://www.docker.com/products/docker-desktop))
- **Git**

### Setup (First Time)

1. **Clone the repository** (or open in GitHub Codespaces):

   ```bash
   git clone <repo-url>
   cd ai-forex-platform
   ```

2. **Copy environment file**:

   ```bash
   cp .env.example .env
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Start the database** (required for the API health check to pass):

   ```bash
   npm run db:up
   ```

5. **Run migrations and seed data**:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

6. **Start the development environment**:

   ```bash
   # Terminal 1: Start the API server
   cd services/api && npm run dev

   # Terminal 2: Start the web application
   cd apps/web && npm run dev
   ```

7. **Open the web application**:
   - Web: http://localhost:3000
   - API: http://localhost:3001
   - API Health: http://localhost:3001/health

### GitHub Codespaces

When working in Codespaces, start the app with the same commands above in separate terminal sessions:

```bash
cd /workspaces/aitrade/ai-forex-platform-
npm install
npm run db:up
cd services/api && npm run dev
cd apps/web && npm run dev
```

The web UI is served on port 3000 and the API on port 3001.

## 📋 Development Commands

### Database Management

```bash
# Start PostgreSQL container
npm run db:up

# Stop PostgreSQL container
npm run db:down

# View PostgreSQL logs
npm run db:logs

# Check database health
npm run db:health

# Reset database (delete data and recreate)
npm run db:reset

# Run Prisma migrations
npm run db:migrate

# Seed development data
npm run db:seed

# Full setup (start DB, migrate, seed)
npm run db:setup

# Open Prisma Studio (visual database browser)
npm run db:studio
```

### Project Commands

```bash
# Start all services in development mode
npm run dev

# Build all packages and applications
npm run build

# Run all tests
npm run test

# Run linting
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

### API Service Commands

```bash
cd services/api

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

### Web Application Commands

```bash
cd apps/web

# Start development server (includes hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm lint
```

## 🗄️ Database Configuration

The project uses **PostgreSQL 16** running in Docker Compose.

### Connection Details

- **Host**: `localhost`
- **Port**: `5432`
- **Username**: `ai_forex`
- **Password**: `forex_dev_password` (development only)
- **Database**: `ai_forex`
- **Connection URL**: `postgresql://ai_forex:forex_dev_password@localhost:5432/ai_forex`

### Database Health

Verify the database is running:

```bash
npm run db:health
```

Should output:

```
accepting connections
```

### Inspecting the Database

Open Prisma Studio to visualize and edit data:

```bash
npm run db:studio
```

## 🧪 Testing

### Run All Tests

```bash
npm run test
```

### Test by Service

```bash
# Test shared types
cd packages/types && npm test

# Test API
cd services/api && npm test
```

## 🔨 Building for Production

```bash
npm run build
```

This compiles all packages and applications.

## 📚 Architecture Overview

See [docs/architecture.md](docs/architecture.md) for:

- High-level system design
- Service boundaries
- Database schema
- Frontend/backend relationship
- Future microservices planning

## 📖 Development Rules

See [docs/development-rules.md](docs/development-rules.md) for:

- No hardcoded secrets rule
- Frontend is always a client rule
- Financial calculation guidelines
- AI system constraints
- Testing requirements

## ⚙️ Environment Variables

The `.env` file controls configuration. Example values:

```env
# Environment
APP_ENV=development

# Database (Docker Compose PostgreSQL)
DATABASE_URL=postgresql://ai_forex:forex_dev_password@localhost:5432/ai_forex

# API Configuration
API_PORT=3001
API_HOST=localhost

# Web Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# AI Services (placeholders)
AI_PROVIDER=openai
AI_API_KEY=placeholder_ai_key

# Market Data (placeholders)
MARKET_DATA_PROVIDER=placeholder_market_data
MARKET_DATA_API_KEY=placeholder_market_key

# Broker Integration (placeholders - DEMO ONLY)
BROKER_PROVIDER=placeholder_broker
BROKER_API_KEY=placeholder_broker_key
BROKER_SECRET=placeholder_broker_secret
```

**Important**: Never commit secrets. Copy `.env.example` and add actual keys locally.

## 🐛 Troubleshooting

### Database Connection Failed

1. Check if PostgreSQL is running:

   ```bash
   npm run db:health
   ```

2. If not running, start it:

   ```bash
   npm run db:up
   ```

3. Check logs:
   ```bash
   npm run db:logs
   ```

### Port Already in Use

If port 5432 (database) or 3000/3001 are already in use:

1. Find and kill the process:

   ```bash
   # Find process on port 5432
   lsof -i :5432

   # Kill it (replace PID with actual process ID)
   kill -9 <PID>
   ```

2. Or change the port in `docker-compose.yml` and update `.env`

### Migrations Failed

Reset the database and rerun migrations:

```bash
npm run db:reset
npm run db:migrate
npm run db:seed
```

### npm Dependencies Issue

Clear and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

## 🔐 Security Notes

- **No secrets in code**: All credentials use environment variables
- **Demo-only trading**: All development uses DEMO accounts
- **No real brokers**: Broker integration is a future milestone
- **Server-side logic**: All business logic runs on the backend
- **Validated input**: All external input is validated with Zod

## 🎓 Learning the Codebase

1. **Start here**: [docs/architecture.md](docs/architecture.md)
2. **Understand the rules**: [docs/development-rules.md](docs/development-rules.md)
3. **Explore shared types**: [packages/types/src/index.ts](packages/types/src/index.ts)
4. **Review API endpoints**: [services/api/src/index.ts](services/api/src/index.ts)
5. **Check database schema**: [database/prisma/schema.prisma](database/prisma/schema.prisma)

## 🚢 Deployment

This is not yet ready for production. Deployment guidelines will be added in future milestones.

## 📞 Support

For issues or questions:

1. Check [docs/development-rules.md](docs/development-rules.md)
2. Check [docs/architecture.md](docs/architecture.md)
3. Run health checks: `npm run db:health`
4. Check service logs

## 📄 License

[Your License Here]

---

**Current Version**: 0.1.0 (D0 — Foundation Release)

**Next Milestone**: M1 — Web Application Shell
