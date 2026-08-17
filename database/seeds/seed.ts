import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed market pairs
  const marketPairs = [
    {
      symbol: 'EUR/USD',
      baseCurrency: 'EUR',
      quoteCurrency: 'USD',
      description: 'Euro vs US Dollar',
    },
    {
      symbol: 'GBP/USD',
      baseCurrency: 'GBP',
      quoteCurrency: 'USD',
      description: 'British Pound vs US Dollar',
    },
    {
      symbol: 'USD/JPY',
      baseCurrency: 'USD',
      quoteCurrency: 'JPY',
      description: 'US Dollar vs Japanese Yen',
    },
    {
      symbol: 'USD/CHF',
      baseCurrency: 'USD',
      quoteCurrency: 'CHF',
      description: 'US Dollar vs Swiss Franc',
    },
    {
      symbol: 'AUD/USD',
      baseCurrency: 'AUD',
      quoteCurrency: 'USD',
      description: 'Australian Dollar vs US Dollar',
    },
    {
      symbol: 'NZD/USD',
      baseCurrency: 'NZD',
      quoteCurrency: 'USD',
      description: 'New Zealand Dollar vs US Dollar',
    },
  ];

  for (const pair of marketPairs) {
    await prisma.marketPair.upsert({
      where: { symbol: pair.symbol },
      update: {},
      create: pair,
    });
  }

  console.log('✓ Market pairs seeded');

  // Seed strategies
  const strategies = [
    {
      name: 'Scalping Quick Win',
      description: 'High-frequency scalping strategy for quick profits',
      tradingStyle: 'SCALPING',
      operatingMode: 'ANALYST',
    },
    {
      name: 'Intraday Momentum',
      description: 'Intraday momentum-based strategy',
      tradingStyle: 'INTRADAY',
      operatingMode: 'SCOUT',
    },
    {
      name: 'Swing Trade Pro',
      description: 'Multi-day swing trading strategy',
      tradingStyle: 'SWING',
      operatingMode: 'AUTONOMOUS_PAPER',
    },
    {
      name: 'Position Hold',
      description: 'Long-term position holding strategy',
      tradingStyle: 'POSITION',
      operatingMode: 'HUMAN_APPROVAL',
    },
  ];

  const createdStrategies: Record<string, { id: string }> = {};
  for (const strategy of strategies) {
    const created = await prisma.strategy.upsert({
      where: { name: strategy.name },
      update: {},
      create: strategy,
    });
    createdStrategies[strategy.name] = { id: created.id };
  }

  for (const strategyName of Object.keys(createdStrategies)) {
    await prisma.strategyVersion.upsert({
      where: {
        id: `strategy-version-${strategyName.toLowerCase().replace(/\s+/g, '-')}`,
      },
      update: {},
      create: {
        id: `strategy-version-${strategyName.toLowerCase().replace(/\s+/g, '-')}`,
        strategyId: createdStrategies[strategyName].id,
        version: 'v1.0.0',
        name: `${strategyName} v1`,
        parameters: {
          mode: 'M7_FOUNDATION',
          notes: 'Version metadata for future strategy engine work',
        },
        status: 'ACTIVE',
      },
    });
  }

  console.log('✓ Strategies seeded');

  const strategy = await prisma.strategy.findFirst({
    where: { name: 'Swing Trade Pro' },
    include: { versions: true },
  });

  if (strategy?.versions?.[0]) {
    const aiHistory = await prisma.aiAnalysisHistory.create({
      data: {
        symbol: 'EUR/USD',
        tradingMode: 'SWING',
        timeframe: '4h',
        direction: 'LONG',
        assessment: 'FAVORABLE',
        confidence: 74,
        summary: 'M7 foundation analysis generated for lifecycle audit trail.',
        reasons: [
          'Trend aligned with longer timeframe structure',
          'Opportunity is suitable for proposal tracking',
        ],
        risks: ['Mock-only environment'],
        invalidationConditions: ['Price falls below support'],
        provider: 'mock',
        model: 'mock-analyst-v1',
        marketDataMode: 'MOCK',
        sourceContext: { milestone: 'M7', generatedBy: 'seed' },
        analyzedAt: new Date(),
      },
    });

    await prisma.tradeProposal.create({
      data: {
        symbol: 'EUR/USD',
        direction: 'LONG',
        tradingMode: 'SWING',
        tradingStyle: 'SWING',
        strategyId: strategy.id,
        strategyVersionId: strategy.versions[0].id,
        aiAnalysisId: aiHistory.id,
        thesis:
          'Seeded M7 proposal to verify the lifecycle foundation without execution.',
        status: 'DRAFT',
        approvalStatus: 'PENDING',
      },
    });

    console.log('✓ M7 lifecycle seed data created');
  }

  // Seed demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@forex-platform.local' },
    update: {},
    create: {
      email: 'demo@forex-platform.local',
      name: 'Demo User',
    },
  });

  console.log('✓ Demo user created');

  // Seed demo trading account
  await prisma.tradingAccount.upsert({
    where: { id: 'demo-account-001' },
    update: {},
    create: {
      id: 'demo-account-001',
      userId: user.id,
      accountName: 'Demo Account',
      accountType: 'DEMO',
      currency: 'USD',
      initialBalance: 100000,
      currentBalance: 100000,
    },
  });

  console.log('✓ Demo trading account created');
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
