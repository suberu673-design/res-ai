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
 * Trade status - lifecycle of a trade
 */
export enum TradeStatus {
  PROPOSED = 'PROPOSED',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
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
