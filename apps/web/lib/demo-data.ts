import {
  OperatingMode,
  TradeDirection,
  TradeStatus,
  TradingStyle,
} from '@forex-platform/types';

export type NavItem = {
  label: string;
  href: string;
  icon: string;
};

export type DashboardMetric = {
  label: string;
  value: string;
  note: string;
  tone?: 'positive' | 'negative' | 'neutral' | 'warning';
};

export type OpportunityRow = {
  pair: string;
  direction: TradeDirection;
  score: number;
  tradingStyle: TradingStyle;
  strategy: string;
  status: string;
  confidence: number;
  entryZone: string;
  stop: string;
  target: string;
  riskReward: string;
  why: string;
  risks: string[];
  invalidation: string[];
};

export type PositionRow = {
  pair: string;
  direction: TradeDirection;
  entry: string;
  current: string;
  pnl: string;
  rMultiple: string;
  strategy: string;
  tradingStyle: TradingStyle;
  status: TradeStatus;
};

export type ActivityEvent = {
  time: string;
  title: string;
  detail: string;
};

export const navigationItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: '▣' },
  { label: 'Market Radar', href: '/radar', icon: '◎' },
  { label: 'AI Activity', href: '/activity', icon: '◌' },
  { label: 'Positions', href: '/positions', icon: '◫' },
  { label: 'Trades', href: '/trades', icon: '↗' },
  { label: 'Journal', href: '/journal', icon: '✎' },
  { label: 'Strategies', href: '/strategies', icon: '✦' },
  { label: 'Backtesting', href: '/backtesting', icon: '↺' },
  { label: 'Analytics', href: '/analytics', icon: '▤' },
  { label: 'Settings', href: '/settings', icon: '⚙' },
];

export const dashboardMetrics: DashboardMetric[] = [
  { label: 'Account Balance', value: '$100,000', note: 'Paper Account', tone: 'positive' },
  { label: "Today's P&L", value: '+$842', note: 'Demo performance', tone: 'positive' },
  { label: 'Open Positions', value: '3', note: 'Across 4 pairs', tone: 'neutral' },
  { label: 'Drawdown', value: '1.2%', note: 'Demo account risk', tone: 'warning' },
  { label: 'AI Opportunities', value: '7', note: 'Scored this cycle', tone: 'neutral' },
  { label: 'AI Confidence', value: '82%', note: 'System average', tone: 'positive' },
];

export const opportunityRows: OpportunityRow[] = [
  {
    pair: 'EUR/USD',
    direction: TradeDirection.LONG,
    score: 91,
    tradingStyle: TradingStyle.INTRADAY,
    strategy: 'Momentum Breakout',
    status: 'Bullish Trend',
    confidence: 82,
    entryZone: '1.1740 – 1.1750',
    stop: '1.1715',
    target: '1.1800',
    riskReward: '2.1 : 1',
    why: 'Price remains above weekly VWAP with persistent institutional bids and improving momentum.',
    risks: ['News volatility near London session close', 'Weakening US dollar momentum'],
    invalidation: ['Break below 1.1715', 'Loss of 20 EMA support'],
  },
  {
    pair: 'GBP/JPY',
    direction: TradeDirection.SHORT,
    score: 87,
    tradingStyle: TradingStyle.INTRADAY,
    strategy: 'Mean Reversion',
    status: 'Supply Pressure',
    confidence: 76,
    entryZone: '198.60 – 198.90',
    stop: '199.35',
    target: '197.40',
    riskReward: '2.4 : 1',
    why: 'Recent rally is stretching above prior intraday balance with fading momentum and lower highs.',
    risks: ['BoJ intervention risk', 'A strong UK data surprise'],
    invalidation: ['Above 199.40', 'Break back into prior range'],
  },
  {
    pair: 'USD/JPY',
    direction: TradeDirection.SHORT,
    score: 83,
    tradingStyle: TradingStyle.SCALPING,
    strategy: 'Range Fade',
    status: 'Pressure Building',
    confidence: 71,
    entryZone: '148.20 – 148.35',
    stop: '148.60',
    target: '147.50',
    riskReward: '1.9 : 1',
    why: 'USD strength is broadening while yen demand is accelerating into the Tokyo close.',
    risks: ['Fast reversal around 148.50', 'Potential risk-off flows'],
    invalidation: ['Break above 148.70', 'Failure at 148.20 support'],
  },
  {
    pair: 'GBP/USD',
    direction: TradeDirection.LONG,
    score: 79,
    tradingStyle: TradingStyle.SHORT_TERM,
    strategy: 'Trend Continuation',
    status: 'Trend Supported',
    confidence: 68,
    entryZone: '1.2860 – 1.2874',
    stop: '1.2828',
    target: '1.2955',
    riskReward: '2.7 : 1',
    why: 'Bullish structure remains intact with higher lows and improving relative strength.',
    risks: ['Cable volatility from UK CPI', 'Below-expected US growth data'],
    invalidation: ['Close below 1.2825', 'Failure to hold 20 EMA'],
  },
];

export const positionRows: PositionRow[] = [
  {
    pair: 'EUR/USD',
    direction: TradeDirection.LONG,
    entry: '1.17432',
    current: '1.17601',
    pnl: '+$612',
    rMultiple: '+1.4R',
    strategy: 'Momentum',
    tradingStyle: TradingStyle.INTRADAY,
    status: TradeStatus.OPEN,
  },
  {
    pair: 'USD/JPY',
    direction: TradeDirection.SHORT,
    entry: '148.34',
    current: '147.92',
    pnl: '+$231',
    rMultiple: '+0.8R',
    strategy: 'Range Fade',
    tradingStyle: TradingStyle.SCALPING,
    status: TradeStatus.OPEN,
  },
  {
    pair: 'GBP/JPY',
    direction: TradeDirection.SHORT,
    entry: '198.76',
    current: '198.91',
    pnl: '-$188',
    rMultiple: '-0.5R',
    strategy: 'Mean Reversion',
    tradingStyle: TradingStyle.INTRADAY,
    status: TradeStatus.OPEN,
  },
];

export const activityFeed: ActivityEvent[] = [
  { time: '03:21:10', title: 'Scanner started', detail: 'Market scan triggered for major FX pairs.' },
  { time: '03:21:11', title: 'EUR/USD opportunity detected', detail: 'Momentum breakout model flagged a long setup.' },
  { time: '03:21:12', title: 'Technical analysis completed', detail: 'Trend, volume, and volatility checks passed.' },
  { time: '03:21:13', title: 'Risk assessment completed', detail: 'Position sizing confirmed within demo constraints.' },
  { time: '03:21:14', title: 'Trade thesis created', detail: 'AI narrative and invalidation criteria logged.' },
];

export const systemStatusSummary = {
  operatingMode: OperatingMode.AUTONOMOUS_PAPER,
  tradingStyle: TradingStyle.INTRADAY,
  aiStatus: 'Online',
  account: 'Paper Account',
};
