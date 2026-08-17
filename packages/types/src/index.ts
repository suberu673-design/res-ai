/**
 * Operating modes - how the platform operates
 */
export enum OperatingMode {
  SCOUT = 'SCOUT',
  ANALYST = 'ANALYST',
  AUTONOMOUS_PAPER = 'AUTONOMOUS_PAPER',
  HUMAN_APPROVAL = 'HUMAN_APPROVAL',
  LIVE_AUTONOMOUS = 'LIVE_AUTONOMOUS',
}

/**
 * Trading styles - different timeframe/strategy approaches
 */
export enum TradingStyle {
  SCALPING = 'SCALPING',
  INTRADAY = 'INTRADAY',
  SHORT_TERM = 'SHORT_TERM',
  SWING = 'SWING',
  POSITION = 'POSITION',
}

/**
 * Trade direction
 */
export enum TradeDirection {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

/**
 * Trade proposal lifecycle state
 */
export enum TradeProposalStatus {
  DRAFT = 'DRAFT',
  ANALYZED = 'ANALYZED',
  RISK_PENDING = 'RISK_PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

/**
 * Risk decision lifecycle state
 */
export enum RiskDecisionStatus {
  PENDING = 'PENDING',
  PASS = 'PASS',
  FAIL = 'FAIL',
  OVERRIDE_REQUIRED = 'OVERRIDE_REQUIRED',
  BLOCKED = 'BLOCKED',
}

/**
 * Approval lifecycle state for future human approval workflows
 */
export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  OVERRIDE_REQUIRED = 'OVERRIDE_REQUIRED',
}

/**
 * Order lifecycle status
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  FILLED = 'FILLED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  FAILED = 'FAILED',
}

/**
 * Position lifecycle status
 */
export enum PositionStatus {
  OPEN = 'OPEN',
  PARTIALLY_CLOSED = 'PARTIALLY_CLOSED',
  CLOSED = 'CLOSED',
  LIQUIDATED = 'LIQUIDATED',
}

/**
 * Trade status - lifecycle of a trade
 */
export enum TradeStatus {
  PROPOSED = 'PROPOSED',
  OPEN = 'OPEN',
  PARTIALLY_CLOSED = 'PARTIALLY_CLOSED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

/**
 * AI analysis lifecycle status
 */
export enum AIAnalysisStatus {
  DRAFT = 'DRAFT',
  ANALYZED = 'ANALYZED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Environment configuration
 */
export enum Environment {
  DEVELOPMENT = 'DEVELOPMENT',
  TEST = 'TEST',
  PRODUCTION = 'PRODUCTION',
}

/**
 * API Health Status
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  database?: {
    status: 'connected' | 'disconnected';
    latency?: number;
  };
  services?: Record<string, string>;
}

/**
 * API Version Information
 */
export interface VersionInfo {
  version: string;
  environment: Environment;
  timestamp: Date;
}

/**
 * User account information
 */
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Trading account linked to a user
 */
export interface TradingAccount {
  id: string;
  userId: string;
  accountName: string;
  accountType: 'DEMO' | 'LIVE';
  currency: string;
  initialBalance: number;
  currentBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Market pair (e.g., EUR/USD)
 */
export interface MarketPair {
  id: string;
  symbol: string;
  baseCurrency: string;
  quoteCurrency: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Trading strategy
 */
export interface Strategy {
  id: string;
  name: string;
  description: string;
  tradingStyle: TradingStyle;
  operatingMode: OperatingMode;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Position - an open trade
 */
export interface Position {
  id: string;
  accountId: string;
  pairId: string;
  direction: TradeDirection;
  entryPrice: number;
  entryTime: Date;
  quantity: number;
  status: TradeStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Trade - a completed or active trade record
 */
export interface Trade {
  id: string;
  accountId: string;
  pairId: string;
  direction: TradeDirection;
  entryPrice: number;
  entryTime: Date;
  exitPrice?: number;
  exitTime?: Date;
  quantity: number;
  status: TradeStatus;
  profitLoss?: number;
  profitLossPercent?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Order - a pending or executed order
 */
export interface Order {
  id: string;
  accountId: string;
  pairId: string;
  direction: TradeDirection;
  orderType: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AI Event - log of AI decisions and reasoning
 */
export interface AIEvent {
  id: string;
  accountId?: string;
  eventType: string;
  action: string;
  reasoning: string;
  confidence: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export enum MarketTimeframe {
  ONE_MINUTE = '1m',
  FIVE_MINUTES = '5m',
  FIFTEEN_MINUTES = '15m',
  THIRTY_MINUTES = '30m',
  ONE_HOUR = '1h',
  FOUR_HOURS = '4h',
  ONE_DAY = '1d',
}

export interface MarketPairDefinition {
  symbol: string;
  baseCurrency: string;
  quoteCurrency: string;
}

export interface MarketQuote {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  timestamp: Date;
  source: string;
}

export interface MarketCandle {
  symbol: string;
  timeframe: MarketTimeframe;
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number | null;
  source: string;
}

export interface MarketDataStatus {
  provider: string;
  mode: 'LIVE' | 'MOCK';
  connected: boolean;
  lastSuccessfulUpdate?: Date;
  lastError?: string;
}

export enum MarketTrend {
  BULLISH = 'BULLISH',
  BEARISH = 'BEARISH',
  SIDEWAYS = 'SIDEWAYS',
  UNKNOWN = 'UNKNOWN',
}

export enum MomentumStrength {
  STRONG_BULLISH = 'STRONG_BULLISH',
  BULLISH = 'BULLISH',
  NEUTRAL = 'NEUTRAL',
  BEARISH = 'BEARISH',
  STRONG_BEARISH = 'STRONG_BEARISH',
}

export enum VolatilityRegime {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  EXTREME = 'EXTREME',
}

export enum MarketStructureType {
  HIGHER_HIGHS = 'HIGHER_HIGHS',
  HIGHER_LOWS = 'HIGHER_LOWS',
  LOWER_HIGHS = 'LOWER_HIGHS',
  LOWER_LOWS = 'LOWER_LOWS',
  RANGE = 'RANGE',
  BREAKOUT = 'BREAKOUT',
  BREAKDOWN = 'BREAKDOWN',
  UNKNOWN = 'UNKNOWN',
}

export enum SupportResistanceType {
  SUPPORT = 'SUPPORT',
  RESISTANCE = 'RESISTANCE',
}

export enum CurrencyStrengthLevel {
  STRONG = 'STRONG',
  MODERATE = 'MODERATE',
  NEUTRAL = 'NEUTRAL',
  WEAK = 'WEAK',
}

export interface SupportResistanceLevel {
  price: number;
  type: SupportResistanceType;
  strength: number;
  source: string;
}

export interface BollingerBandsSnapshot {
  upper: number | null;
  middle: number | null;
  lower: number | null;
  stdDev: number | null;
}

export interface IndicatorSnapshot {
  rsi: number | null;
  ema20: number | null;
  ema50: number | null;
  ema100: number | null;
  ema200: number | null;
  macd: number | null;
  signal: number | null;
  histogram: number | null;
  atr: number | null;
  adx: number | null;
  roc: number | null;
  bollingerBands: BollingerBandsSnapshot | null;
  valid: boolean;
  dataStatus: 'ok' | 'insufficient_data' | 'no_data' | 'error';
  source: string;
}

export interface CurrencyStrengthEntry {
  currency: string;
  score: number;
  label: CurrencyStrengthLevel;
}

export interface MarketState {
  symbol: string;
  timeframe: string;
  timestamp: Date;
  trend: MarketTrend;
  momentum: MomentumStrength;
  volatility: VolatilityRegime;
  marketStructure: MarketStructureType;
  supportLevels: SupportResistanceLevel[];
  resistanceLevels: SupportResistanceLevel[];
  indicators: IndicatorSnapshot;
  source: string;
  dataStatus: 'ok' | 'insufficient_data' | 'no_data' | 'error';
  currencyStrength?: CurrencyStrengthEntry[];
}

export enum TradingMode {
  SCALPING = 'SCALPING',
  INTRADAY = 'INTRADAY',
  SHORT_TERM = 'SHORT_TERM',
  SWING = 'SWING',
  POSITION = 'POSITION',
}

export interface TradingModeRequirements {
  minimumTimeframe: string;
  maximumTimeframe: string;
  preferredTimeframes: string[];
  minimumCandles: number;
  minimumLiquidity?: number | null;
  maximumSpread?: number | null;
  maximumTradesPerPeriod?: number | null;
  typicalHoldingPeriod: string;
}

export interface TradingModeConfiguration {
  name: TradingMode;
  description: string;
  primaryTimeframes: string[];
  secondaryTimeframes: string[];
  typicalHoldingPeriod: string;
  minimumDataRequirements: {
    minimumCandles: number;
    minimumHistoryHours?: number | null;
    liquidityNote?: string;
    spreadNote?: string;
  };
  maxTradeFrequency: string;
  preferredSessionBehavior: string;
  riskProfile: string;
  analysisPriorities: string[];
  requirements: TradingModeRequirements;
}

export interface TradingModeContext {
  symbol: string;
  selectedMode: TradingMode;
  modeConfiguration: TradingModeConfiguration;
  currentTimeframe: string;
  marketState: Partial<MarketState> | null;
  modeRequirements: TradingModeRequirements;
  priorities: string[];
  prioritySet: string[];
}

export const TRADING_MODE_CONFIGURATIONS: Record<
  TradingMode,
  TradingModeConfiguration
> = {
  [TradingMode.SCALPING]: {
    name: TradingMode.SCALPING,
    description:
      'Very short-horizon execution context focused on spread friction, momentum, and immediate structure.',
    primaryTimeframes: ['1m', '5m'],
    secondaryTimeframes: ['15m'],
    typicalHoldingPeriod: 'seconds to minutes',
    minimumDataRequirements: {
      minimumCandles: 80,
      minimumHistoryHours: 2,
      liquidityNote:
        'Requires sufficient liquidity and low execution friction.',
      spreadNote:
        'Spread and slippage sensitivity is materially higher than longer horizons.',
    },
    maxTradeFrequency: 'frequent opportunities',
    preferredSessionBehavior:
      'fast entries during active sessions with tight execution conditions',
    riskProfile: 'high sensitivity to spread and execution quality',
    analysisPriorities: [
      'momentum',
      'volatility',
      'spreadConditions',
      'recentMarketStructure',
    ],
    requirements: {
      minimumTimeframe: '1m',
      maximumTimeframe: '15m',
      preferredTimeframes: ['1m', '5m', '15m'],
      minimumCandles: 80,
      minimumLiquidity: null,
      maximumSpread: null,
      maximumTradesPerPeriod: null,
      typicalHoldingPeriod: 'seconds to minutes',
    },
  },
  [TradingMode.INTRADAY]: {
    name: TradingMode.INTRADAY,
    description:
      'Session-aware regime emphasizing short-term structure, momentum, and same-day exits.',
    primaryTimeframes: ['5m', '15m', '1h'],
    secondaryTimeframes: ['4h'],
    typicalHoldingPeriod: 'minutes to hours',
    minimumDataRequirements: {
      minimumCandles: 120,
      minimumHistoryHours: 12,
      liquidityNote: 'Works best when session liquidity is stable and active.',
      spreadNote:
        'Execution conditions still matter, but less than for scalping.',
    },
    maxTradeFrequency: 'moderate trade frequency',
    preferredSessionBehavior:
      'session-aware with attention to intraday structure and volatility changes',
    riskProfile: 'balanced execution and volatility tolerance',
    analysisPriorities: [
      'momentum',
      'sessionContext',
      'shortTermStructure',
      'volatility',
    ],
    requirements: {
      minimumTimeframe: '5m',
      maximumTimeframe: '4h',
      preferredTimeframes: ['5m', '15m', '1h', '4h'],
      minimumCandles: 120,
      minimumLiquidity: null,
      maximumSpread: null,
      maximumTradesPerPeriod: null,
      typicalHoldingPeriod: 'minutes to hours',
    },
  },
  [TradingMode.SHORT_TERM]: {
    name: TradingMode.SHORT_TERM,
    description:
      'Moderate horizon focused on trend strength, structure, and controlled trade frequency.',
    primaryTimeframes: ['1h', '4h'],
    secondaryTimeframes: ['15m', '1d'],
    typicalHoldingPeriod: 'hours to several days',
    minimumDataRequirements: {
      minimumCandles: 160,
      minimumHistoryHours: 48,
      liquidityNote:
        'Liquidity should be stable enough to support trend-following behavior.',
      spreadNote:
        'Spread is less dominant than execution quality, but still relevant.',
    },
    maxTradeFrequency: 'moderate trade frequency',
    preferredSessionBehavior:
      'trend and structure driven with lower turnover than intraday',
    riskProfile: 'moderate risk with stronger structural emphasis',
    analysisPriorities: [
      'trend',
      'momentum',
      'marketStructure',
      'supportResistance',
    ],
    requirements: {
      minimumTimeframe: '15m',
      maximumTimeframe: '1d',
      preferredTimeframes: ['15m', '1h', '4h', '1d'],
      minimumCandles: 160,
      minimumLiquidity: null,
      maximumSpread: null,
      maximumTradesPerPeriod: null,
      typicalHoldingPeriod: 'hours to several days',
    },
  },
  [TradingMode.SWING]: {
    name: TradingMode.SWING,
    description:
      'Broad trend and structure context with larger price movement and lower turnover.',
    primaryTimeframes: ['4h', '1d'],
    secondaryTimeframes: ['1h', '1w'],
    typicalHoldingPeriod: 'several days to weeks',
    minimumDataRequirements: {
      minimumCandles: 220,
      minimumHistoryHours: 240,
      liquidityNote:
        'Requires stable market participation and broader regime context.',
      spreadNote:
        'Lower trade frequency means spread impact is less acute but still matters.',
    },
    maxTradeFrequency: 'lower trade frequency',
    preferredSessionBehavior:
      'trend-following and regime-aware with wider risk tolerance',
    riskProfile: 'wider risk tolerance and lower turnover',
    analysisPriorities: [
      'trend',
      'marketStructure',
      'supportResistance',
      'volatility',
    ],
    requirements: {
      minimumTimeframe: '1h',
      maximumTimeframe: '1w',
      preferredTimeframes: ['1h', '4h', '1d', '1w'],
      minimumCandles: 220,
      minimumLiquidity: null,
      maximumSpread: null,
      maximumTradesPerPeriod: null,
      typicalHoldingPeriod: 'several days to weeks',
    },
  },
  [TradingMode.POSITION]: {
    name: TradingMode.POSITION,
    description:
      'Major trend and regime context with very low turnover and broad market awareness.',
    primaryTimeframes: ['1d', '1w'],
    secondaryTimeframes: ['4h'],
    typicalHoldingPeriod: 'weeks to months',
    minimumDataRequirements: {
      minimumCandles: 300,
      minimumHistoryHours: 720,
      liquidityNote:
        'Higher timeframe context is more important than short-term noise.',
      spreadNote: 'Spread matters less than major regime and trend context.',
    },
    maxTradeFrequency: 'very low trade frequency',
    preferredSessionBehavior:
      'major trend and regime emphasis with broader macro context',
    riskProfile: 'lower turnover and emphasis on long-term market context',
    analysisPriorities: [
      'majorTrend',
      'marketStructure',
      'volatilityRegime',
      'higherTimeframeContext',
      'currencyStrength',
    ],
    requirements: {
      minimumTimeframe: '1d',
      maximumTimeframe: '1w',
      preferredTimeframes: ['1d', '1w', '4h'],
      minimumCandles: 300,
      minimumLiquidity: null,
      maximumSpread: null,
      maximumTradesPerPeriod: null,
      typicalHoldingPeriod: 'weeks to months',
    },
  },
};

export function getTradingModeConfiguration(
  mode: TradingMode
): TradingModeConfiguration {
  const config = TRADING_MODE_CONFIGURATIONS[mode];
  if (!config) {
    throw new Error(`Unsupported trading mode: ${String(mode)}`);
  }
  return config;
}

export function getTradingModeRequirements(
  mode: TradingMode
): TradingModeRequirements {
  return getTradingModeConfiguration(mode).requirements;
}

export function normalizeTradingMode(mode: string): TradingMode | null {
  const normalized = String(mode ?? '')
    .trim()
    .toUpperCase();
  if (normalized === 'SHORT_TERM') {
    return TradingMode.SHORT_TERM;
  }
  if (normalized === 'SHORT-TERM') {
    return TradingMode.SHORT_TERM;
  }
  return Object.values(TradingMode).includes(normalized as TradingMode)
    ? (normalized as TradingMode)
    : null;
}

function normalizeTimeframe(value: string | null | undefined): string {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

export function isTimeframeCompatible(
  mode: TradingMode,
  timeframe: string
): boolean {
  const normalized = normalizeTimeframe(timeframe);
  const config = getTradingModeConfiguration(mode);
  const valid = new Set([
    ...config.primaryTimeframes,
    ...config.secondaryTimeframes,
  ]);
  return (
    valid.has(normalized) ||
    (mode === TradingMode.POSITION &&
      (normalized === '1d' || normalized === '1w'))
  );
}

export function isModeCompatibleWithMarketState(
  mode: TradingMode,
  marketState: Partial<MarketState> | null | undefined
): boolean {
  if (!marketState) {
    return false;
  }

  const status = marketState.dataStatus ?? 'ok';
  if (
    status === 'no_data' ||
    status === 'insufficient_data' ||
    status === 'error'
  ) {
    return false;
  }

  if (marketState.indicators && marketState.indicators.valid === false) {
    return false;
  }

  if (mode === TradingMode.SCALPING) {
    return Boolean(
      marketState.momentum ||
      marketState.volatility ||
      marketState.marketStructure
    );
  }

  return Boolean(
    marketState.trend ||
    marketState.marketStructure ||
    marketState.volatility ||
    marketState.momentum
  );
}

export interface TradingModeValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateModeContext(
  context: Partial<TradingModeContext>
): TradingModeValidationResult {
  const errors: string[] = [];

  if (!context.symbol || !String(context.symbol).trim()) {
    errors.push('symbol is required');
  }

  if (
    !context.selectedMode ||
    !Object.values(TradingMode).includes(context.selectedMode)
  ) {
    errors.push('a valid trading mode is required');
  }

  if (!context.currentTimeframe || !context.selectedMode) {
    errors.push('timeframe is required');
  } else if (
    !isTimeframeCompatible(context.selectedMode, context.currentTimeframe)
  ) {
    errors.push(
      `timeframe ${context.currentTimeframe} is not compatible with ${context.selectedMode}`
    );
  }

  if (!context.marketState) {
    errors.push('marketState is required');
  } else if (
    !isModeCompatibleWithMarketState(
      context.selectedMode as TradingMode,
      context.marketState
    )
  ) {
    errors.push('marketState does not satisfy the selected mode requirements');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function buildTradingContext({
  symbol,
  mode,
  timeframe,
  marketState,
}: {
  symbol: string;
  mode: TradingMode;
  timeframe: string;
  marketState: Partial<MarketState> | null;
}): TradingModeContext {
  const config = getTradingModeConfiguration(mode);
  const context: TradingModeContext = {
    symbol,
    selectedMode: mode,
    modeConfiguration: config,
    currentTimeframe: timeframe,
    marketState,
    modeRequirements: config.requirements,
    priorities: [...config.analysisPriorities],
    prioritySet: [...config.analysisPriorities],
  };

  return context;
}

export function isValidTradeProposalTransition(
  from: string,
  to: string
): boolean {
  const valid: Record<string, string[]> = {
    [TradeProposalStatus.DRAFT]: [TradeProposalStatus.ANALYZED],
    [TradeProposalStatus.ANALYZED]: [
      TradeProposalStatus.RISK_PENDING,
      TradeProposalStatus.EXPIRED,
    ],
    [TradeProposalStatus.RISK_PENDING]: [
      TradeProposalStatus.APPROVED,
      TradeProposalStatus.REJECTED,
      TradeProposalStatus.EXPIRED,
    ],
    [TradeProposalStatus.APPROVED]: [],
    [TradeProposalStatus.REJECTED]: [],
    [TradeProposalStatus.EXPIRED]: [],
  };

  return valid[from]?.includes(to) ?? false;
}

export function isValidRiskDecisionTransition(
  from: string,
  to: string
): boolean {
  const valid: Record<string, string[]> = {
    [RiskDecisionStatus.PENDING]: [
      RiskDecisionStatus.PASS,
      RiskDecisionStatus.FAIL,
      RiskDecisionStatus.OVERRIDE_REQUIRED,
      RiskDecisionStatus.BLOCKED,
    ],
    [RiskDecisionStatus.PASS]: [],
    [RiskDecisionStatus.FAIL]: [],
    [RiskDecisionStatus.OVERRIDE_REQUIRED]: [],
    [RiskDecisionStatus.BLOCKED]: [],
  };

  return valid[from]?.includes(to) ?? false;
}

export function isValidOrderTransition(from: string, to: string): boolean {
  const valid: Record<string, string[]> = {
    [OrderStatus.PENDING]: [OrderStatus.SUBMITTED, OrderStatus.CANCELLED],
    [OrderStatus.SUBMITTED]: [
      OrderStatus.PARTIALLY_FILLED,
      OrderStatus.FILLED,
      OrderStatus.CANCELLED,
      OrderStatus.REJECTED,
      OrderStatus.FAILED,
    ],
    [OrderStatus.PARTIALLY_FILLED]: [
      OrderStatus.FILLED,
      OrderStatus.CANCELLED,
      OrderStatus.FAILED,
    ],
    [OrderStatus.FILLED]: [],
    [OrderStatus.CANCELLED]: [],
    [OrderStatus.REJECTED]: [],
    [OrderStatus.FAILED]: [],
  };

  return valid[from]?.includes(to) ?? false;
}

export function isValidPositionTransition(from: string, to: string): boolean {
  const valid: Record<string, string[]> = {
    [PositionStatus.OPEN]: [
      PositionStatus.PARTIALLY_CLOSED,
      PositionStatus.CLOSED,
      PositionStatus.LIQUIDATED,
    ],
    [PositionStatus.PARTIALLY_CLOSED]: [
      PositionStatus.CLOSED,
      PositionStatus.LIQUIDATED,
    ],
    [PositionStatus.CLOSED]: [],
    [PositionStatus.LIQUIDATED]: [],
  };

  return valid[from]?.includes(to) ?? false;
}

export function isValidTradeTransition(from: string, to: string): boolean {
  const valid: Record<string, string[]> = {
    [TradeStatus.PROPOSED]: [TradeStatus.OPEN, TradeStatus.CANCELLED],
    [TradeStatus.OPEN]: [
      TradeStatus.PARTIALLY_CLOSED,
      TradeStatus.CLOSED,
      TradeStatus.CANCELLED,
    ],
    [TradeStatus.PARTIALLY_CLOSED]: [TradeStatus.CLOSED],
    [TradeStatus.CLOSED]: [],
    [TradeStatus.CANCELLED]: [],
    [TradeStatus.REJECTED]: [],
  };

  return valid[from]?.includes(to) ?? false;
}

export function isValidAIAnalysisTransition(from: string, to: string): boolean {
  const valid: Record<string, string[]> = {
    [AIAnalysisStatus.DRAFT]: [AIAnalysisStatus.ANALYZED],
    [AIAnalysisStatus.ANALYZED]: [AIAnalysisStatus.ARCHIVED],
    [AIAnalysisStatus.ARCHIVED]: [],
  };

  return valid[from]?.includes(to) ?? false;
}

/**
 * API Error Response
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: Date;
}

/**
 * Strategy parameter values deliberately kept to JSON-safe primitives and nested maps.
 * This keeps the contract compatible with the persisted StrategyVersion.parameters Json field
 * without introducing a heavy generic configuration system.
 */
export type StrategyParameterValue =
  | string
  | number
  | boolean
  | null
  | StrategyParameterValue[]
  | { [key: string]: StrategyParameterValue };

export interface StrategyParameters {
  [key: string]: StrategyParameterValue;
}

/**
 * Strategy evaluation input - canonical deterministic context for a future strategy engine.
 * This intentionally excludes account, broker, order, and execution state.
 */
export interface StrategyEvaluationInput {
  symbol: string;
  timeframe: string;
  marketState: Partial<MarketState> | null;
  tradingMode: TradingMode;
  tradingStyle?: TradingStyle | null;
  strategyId?: string | null;
  strategyVersion?: Pick<
    StrategyVersion,
    | 'id'
    | 'strategyId'
    | 'version'
    | 'name'
    | 'status'
    | 'parameters'
    | 'createdAt'
    | 'updatedAt'
  > | null;
  parameters: StrategyParameters;
}

/**
 * Strategy signal direction - a decision signal only, not an order or trade instruction.
 */
export enum StrategySignalDirection {
  LONG = 'LONG',
  SHORT = 'SHORT',
  NEUTRAL = 'NEUTRAL',
}

/**
 * Strategy signal returned by a future Strategy Engine.
 * This is an output contract, not a broker or order representation.
 */
export interface StrategySignal {
  id: string;
  symbol: string;
  timeframe: string;
  direction: StrategySignalDirection;
  confidence: number;
  rationale: string[];
  strategyId?: string | null;
  strategyVersionId?: string | null;
  evaluatedAt?: Date | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Evaluation result returned by a future Strategy Engine.
 * It can represent either a valid signal or a deliberate no-signal outcome.
 */
export interface StrategyEvaluationResult {
  strategyId: string;
  strategyVersionId?: string | null;
  symbol: string;
  timeframe: string;
  tradingMode: TradingMode;
  producedSignal: boolean;
  signal: StrategySignal | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * AI Assessment - how the analyst views the setup
 */
export enum AIAssessment {
  FAVORABLE = 'FAVORABLE',
  CAUTIOUS = 'CAUTIOUS',
  UNFAVORABLE = 'UNFAVORABLE',
  NEUTRAL = 'NEUTRAL',
}

/**
 * AI Analysis Context - structured input for the AI analyst
 */
export interface AIAnalysisContext {
  symbol: string;
  tradingMode: TradingMode;
  timeframe: string;
  currentPrice: number | null;
  marketState: Partial<MarketState> | null;
  opportunity: {
    direction: string;
    score: number;
    confidence: number;
    reasons: string[];
    riskFlags: string[];
  };
  marketDataSource: string;
  marketDataMode: 'LIVE' | 'MOCK';
}

/**
 * AI Analysis - structured output from the AI analyst
 */
export interface AIAnalysis {
  id: string;
  symbol: string;
  tradingMode: TradingMode;
  timeframe: string;
  direction: TradeDirection;
  assessment: AIAssessment;
  confidence: number;
  summary: string;
  reasons: string[];
  risks: string[];
  invalidationConditions: string[];
  suggestedObservation: string | null;
  analyzedAt: Date;
  model: string;
  provider: string;
  marketDataMode: 'LIVE' | 'MOCK';
  opportunityScore: number | null;
}

export interface StrategyVersion {
  id: string;
  strategyId: string;
  version: string;
  name?: string | null;
  parameters?: Record<string, unknown> | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIAnalysisHistory {
  id: string;
  opportunityId?: string | null;
  symbol: string;
  direction?: string | null;
  tradingMode?: string | null;
  timeframe?: string | null;
  assessment?: string | null;
  confidence?: number | null;
  summary?: string | null;
  reasons?: string[] | null;
  risks?: string[] | null;
  invalidationConditions?: string[] | null;
  provider?: string | null;
  model?: string | null;
  sourceContext?: Record<string, unknown> | null;
  analyzedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TradeProposal {
  id: string;
  opportunityId?: string | null;
  aiAnalysisId?: string | null;
  strategyId?: string | null;
  strategyVersionId?: string | null;
  symbol: string;
  tradingMode?: string | null;
  tradingStyle?: string | null;
  direction: string;
  proposedEntryPrice?: number | null;
  proposedStopPrice?: number | null;
  proposedTargetPrice?: number | null;
  riskRewardRatio?: number | null;
  confidence?: number | null;
  thesis?: string | null;
  invalidationConditions?: string[] | null;
  status: TradeProposalStatus;
  approvalStatus?: ApprovalStatus | null;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  rejectedReason?: string | null;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskDecision {
  id: string;
  tradeProposalId: string;
  status: RiskDecisionStatus;
  evaluatedAt?: Date | null;
  reason?: string | null;
  riskFlags?: Record<string, unknown> | null;
  evaluator?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalEvent {
  id: string;
  tradeId?: string | null;
  tradeProposalId?: string | null;
  eventType: string;
  message?: string | null;
  metadata?: Record<string, unknown> | null;
  timestamp: Date;
  createdAt: Date;
}

export interface ExecutionEvent {
  id: string;
  orderId?: string | null;
  tradeId?: string | null;
  tradeProposalId?: string | null;
  eventType: string;
  metadata?: Record<string, unknown> | null;
  timestamp: Date;
  createdAt: Date;
}

/**
 * AI Analysis validation error
 */
export interface AIAnalysisValidationError {
  field: string;
  message: string;
}
