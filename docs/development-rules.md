# Development Rules

These are the core rules that guide development of the AI Forex Trading Platform.

## Fundamental Rules

### 1. No Hardcoded Secrets
- **NEVER** commit API keys, passwords, or tokens to the repository
- Use environment variables (`.env`) for all secrets
- Copy `.env.example` to `.env` locally (never commit `.env`)
- All example values must be clearly marked as placeholders

### 2. No Real-Money Trading During Development
- All development uses DEMO accounts only
- Account type must be explicitly set to "DEMO"
- Production migrations for live accounts are a future milestone
- Paper trading is the only mode for all development milestones

### 3. Frontend is Always a Client
- The web application has NO business logic
- No trading decisions can be made by the frontend
- No market analysis in the browser
- All calculations happen server-side
- The backend must work independently of any frontend

### 4. Backend Services are Independent
- Each service can be tested in isolation
- Services should not have hard dependencies on other services
- Data flows through the database or API contracts
- Services can eventually run on separate servers

### 5. Keep Services Modular
- One service = one responsibility
- Clear boundaries between services
- Shared logic goes to `/packages`
- Don't duplicate code across services

## Coding Standards

### Type Safety
- All TypeScript files must use strict mode
- No `any` types without justification
- Use types from `@forex-platform/types` for domain concepts
- Export types from index files for easy imports

### Input Validation
- All external input must be validated
- Use Zod for runtime validation
- Validate API requests before processing
- Never trust user input

### Testing
- Write tests for business logic
- Health checks should pass
- API endpoints should be testable
- Use Vitest for unit testing
- Tests should run without external services (use mocks)

### Error Handling
- All errors should be logged with context
- User-facing errors should be clear and actionable
- Never expose internal stack traces to clients
- Log decision points for audit trails

## AI and Trading Rules

### AI Systems
- AI reasoning should operate on structured data
- Never let an LLM directly bypass the risk engine
- All AI decisions must be logged with confidence scores
- Trade theses must be explicit and queryable
- AI must provide reasoning, not just yes/no

### Financial Calculations
- Financial calculations must be deterministic code
- Never let an LLM generate arithmetic
- Use libraries for precision (e.g., Decimal.js for money)
- All calculations must be auditable
- Always round consistently (banker's rounding)

### Risk Management
- Every trade must pass the risk engine
- Position sizing must be calculated, not arbitrary
- Maximum loss limits must be enforced
- Drawdown must be monitored continuously
- All risk decisions must be logged

### Trading Decisions
- All trading decisions must eventually be auditable
- Every trade needs a documented thesis
- Decisions should be reviewable retroactively
- Failed trades should have post-mortems
- Successful trades should be analyzed for patterns

## Development Workflow

### Commits
- Keep commits small and focused
- Commit message should explain the "why"
- One feature per branch
- Tests should pass before committing

### Database Changes
- Migrations are version controlled
- New models should include timestamps (createdAt, updatedAt)
- Foreign keys should enforce referential integrity
- Indexes should be added for query performance
- Seeds should provide realistic development data

### Configuration
- Use environment variables consistently
- Document all environment variables in `.env.example`
- Provide sensible defaults where safe
- Never change defaults without discussion

### Documentation
- Keep docs up to date with code
- Document architecture decisions
- Add comments for non-obvious logic
- Update README when commands change

## Future Planning

### Before Each Milestone
- Review architecture for bottlenecks
- Check performance on realistic data
- Test failure scenarios
- Document lessons learned

### Microservices Transition
- Services should be designed for eventual separation
- Don't assume shared memory
- Use APIs as service boundaries
- Keep state in the database

### Broker Integration
- Account credentials must never touch the frontend
- Broker API calls must be server-side only
- Demo trading and live trading must use identical logic
- Broker connection status must be health-checked

## What NOT to Do

- ❌ Don't implement fake AI and present it as real
- ❌ Don't connect to real-money brokers
- ❌ Don't create automated live trading
- ❌ Don't add unnecessary dependencies without discussion
- ❌ Don't commit secrets or credentials
- ❌ Don't create a giant monolithic backend
- ❌ Don't create placeholder code that looks like it trades
- ❌ Don't add cryptocurrency functionality (this is forex only)
- ❌ Don't skip tests and validations
- ❌ Don't hardcode configuration values
- ❌ Don't make breaking changes without migration paths
- ❌ Don't ignore error cases

## Code Review Checklist

When reviewing code:

- [ ] Does it follow the rules above?
- [ ] Are secrets safely handled?
- [ ] Is the code testable?
- [ ] Are types properly defined?
- [ ] Is there input validation?
- [ ] Are errors handled gracefully?
- [ ] Is the logic auditable?
- [ ] Is the code documented?
- [ ] Can it be understood by someone new to the code?
- [ ] Does it maintain service boundaries?

## Questions Before Implementing

Ask yourself:

1. **Is this in the right service?** - Does it belong here, or in another service?
2. **Is this auditable?** - Can we log and review this decision later?
3. **Is this testable?** - Can we test it without external services?
4. **Is this safe?** - Does it handle errors and edge cases?
5. **Is this the simplest solution?** - Or am I over-engineering?
6. **Will this work in production?** - How would this scale?
7. **Does this respect service boundaries?** - Or am I creating coupling?
8. **Is this documented?** - Can someone else understand it?
