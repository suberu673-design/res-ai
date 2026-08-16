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

  for (const strategy of strategies) {
    await prisma.strategy.upsert({
      where: { name: strategy.name },
      update: {},
      create: strategy,
    });
  }

  console.log('✓ Strategies seeded');

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
