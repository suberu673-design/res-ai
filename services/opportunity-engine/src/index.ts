import {
  CurrencyStrengthLevel,
  MarketState,
  MarketTrend,
  MomentumStrength,
  TradingMode,
  VolatilityRegime,
  type SupportResistanceLevel,
} from '@forex-platform/types';

export type OpportunityDirection = 'LONG' | 'SHORT' | 'NEUTRAL';

export interface OpportunityScoreInputs {
  trend: MarketTrend;
  momentum: MomentumStrength;
  volatility: VolatilityRegime;
  marketStructure: string;
  supportLevels: SupportResistanceLevel[];
  resistanceLevels: SupportResistanceLevel[];
  onlyValidData?: boolean;
  dataStatus?: MarketState['dataStatus'];
}

export interface OpportunityExplanation {
  title: string;
  detail: string;
  evidence: string[];
}

export interface OpportunityRecord {
  symbol: string;
  timeframe: string;
  direction: OpportunityDirection;
  score: number;
  confidence: number;
  reasons: string[];
  riskFlags: string[];
  supportLevel: number | null;
  resistanceLevel: number | null;
  explanation: OpportunityExplanation;
  mode: TradingMode;
  source: string;
  dataStatus: MarketState['dataStatus'];
}

export interface OpportunityFilters {
  minimumScore: number;
  minimumConfidence: number;
  requireValidData: boolean;
  minTrendStrength: number;
}

export const defaultOpportunityFilters: OpportunityFilters = {
  minimumScore: 60,
  minimumConfidence: 50,
  requireValidData: true,
  minTrendStrength: 1,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeMarketStructure(value: string): string {
  return String(value ?? '').toUpperCase();
}

function scoreTrend(trend: MarketTrend): number {
  switch (trend) {
    case MarketTrend.BULLISH:
      return 30;
    case MarketTrend.BEARISH:
      return 30;
    case MarketTrend.SIDEWAYS:
      return 12;
    default:
      return 0;
  }
}

function scoreMomentum(momentum: MomentumStrength): number {
  switch (momentum) {
    case MomentumStrength.STRONG_BULLISH:
      return 28;
    case MomentumStrength.BULLISH:
      return 22;
    case MomentumStrength.STRONG_BEARISH:
      return 28;
    case MomentumStrength.BEARISH:
      return 22;
    default:
      return 8;
  }
}

function scoreVolatility(volatility: VolatilityRegime): number {
  switch (volatility) {
    case VolatilityRegime.HIGH:
      return 12;
    case VolatilityRegime.NORMAL:
      return 16;
    case VolatilityRegime.LOW:
      return 8;
    default:
      return 5;
  }
}

function scoreStructure(marketStructure: string): number {
  const structure = normalizeMarketStructure(marketStructure);
  if (structure.includes('BREAKOUT')) return 18;
  if (structure.includes('BREAKDOWN')) return 18;
  if (structure.includes('HIGHER')) return 12;
  if (structure.includes('LOWER')) return 12;
  if (structure.includes('RANGE')) return 8;
  return 0;
}

function scoreSupportResistance(
  supportLevels: SupportResistanceLevel[],
  resistanceLevels: SupportResistanceLevel[]
): number {
  const supportStrength = supportLevels.reduce((sum, level) => sum + level.strength, 0);
  const resistanceStrength = resistanceLevels.reduce((sum, level) => sum + level.strength, 0);
  return Math.min(12, supportStrength * 3 + resistanceStrength * 2);
}

export function scenarioScore(input: OpportunityScoreInputs): number {
  const total =
    scoreTrend(input.trend) +
    scoreMomentum(input.momentum) +
    scoreVolatility(input.volatility) +
    scoreStructure(input.marketStructure) +
    scoreSupportResistance(input.supportLevels, input.resistanceLevels);

  const qualityPenalty = input.onlyValidData && input.dataStatus === 'ok' ? 0 : -15;
  const adjusted = total + qualityPenalty;
  return clamp(adjusted, 0, 100);
}

function determineDirection(
  trend: MarketTrend,
  momentum: MomentumStrength,
  marketStructure: string
): OpportunityDirection {
  const structure = normalizeMarketStructure(marketStructure);

  if (
    trend === MarketTrend.BULLISH ||
    (momentum === MomentumStrength.BULLISH && !structure.includes('BREAKDOWN')) ||
    momentum === MomentumStrength.STRONG_BULLISH
  ) {
    return 'LONG';
  }

  if (
    trend === MarketTrend.BEARISH ||
    (momentum === MomentumStrength.BEARISH && !structure.includes('BREAKOUT')) ||
    momentum === MomentumStrength.STRONG_BEARISH
  ) {
    return 'SHORT';
  }

  return 'NEUTRAL';
}

function buildReasonList(
  trend: MarketTrend,
  momentum: MomentumStrength,
  structure: string,
  volatility: VolatilityRegime,
  supportLevels: SupportResistanceLevel[],
  resistanceLevels: SupportResistanceLevel[]
): string[] {
  const reasons: string[] = [];

  if (trend === MarketTrend.BULLISH) reasons.push('Trend is constructive and aligned with directional momentum.');
  if (trend === MarketTrend.BEARISH) reasons.push('Trend is bearish and pressure remains on the downside.');
  if (momentum === MomentumStrength.STRONG_BULLISH) reasons.push('Momentum is accelerating with strong bullish confirmation.');
  if (momentum === MomentumStrength.STRONG_BEARISH) reasons.push('Momentum is accelerating with strong bearish confirmation.');
  if (normalizeMarketStructure(structure).includes('BREAKOUT')) reasons.push('Recent structure shows a breakout pattern.');
  if (normalizeMarketStructure(structure).includes('BREAKDOWN')) reasons.push('Recent structure shows a breakdown pattern.');
  if (volatility === VolatilityRegime.HIGH || volatility === VolatilityRegime.NORMAL) reasons.push('Volatility is compatible with opportunistic scanning.');
  if (supportLevels.length) reasons.push('Support zones are present and active in the recent range.');
  if (resistanceLevels.length) reasons.push('Resistance zones are present and can cap or validate the move.');

  if (!reasons.length) reasons.push('Market conditions are mixed and require additional confirmation.');
  return reasons;
}

function buildRiskFlags(
  trend: MarketTrend,
  volatility: VolatilityRegime,
  structure: string
): string[] {
  const flags: string[] = [];

  if (trend === MarketTrend.UNKNOWN) flags.push('Trend context is unclear.');
  if (volatility === VolatilityRegime.EXTREME) flags.push('Extreme volatility may increase execution risk.');
  if (normalizeMarketStructure(structure).includes('RANGE')) flags.push('The market is trading in a narrow range, so breakout quality matters.');

  return flags;
}

export function buildOpportunityFromMarketState(
  marketState: Partial<MarketState> | null,
  mode: TradingMode,
  filters: OpportunityFilters = defaultOpportunityFilters
): OpportunityRecord {
  const symbol = String(marketState?.symbol ?? 'UNKNOWN');
  const timeframe = String(marketState?.timeframe ?? '1h');
  const trend = marketState?.trend ?? MarketTrend.UNKNOWN;
  const momentum = marketState?.momentum ?? MomentumStrength.NEUTRAL;
  const volatility = marketState?.volatility ?? VolatilityRegime.NORMAL;
  const structure = String(marketState?.marketStructure ?? 'UNKNOWN');
  const supportLevels = Array.isArray(marketState?.supportLevels) ? marketState.supportLevels : [];
  const resistanceLevels = Array.isArray(marketState?.resistanceLevels) ? marketState.resistanceLevels : [];
  const source = String(marketState?.source ?? 'mock');
  const dataStatus = marketState?.dataStatus ?? 'insufficient_data';

  const score = scenarioScore({
    trend,
    momentum,
    volatility,
    marketStructure: structure,
    supportLevels,
    resistanceLevels,
    onlyValidData: filters.requireValidData,
    dataStatus,
  });

  const direction = determineDirection(trend, momentum, structure);
  const confidence = clamp(Math.round(score * 0.9), 0, 100);
  const reasons = buildReasonList(
    trend,
    momentum,
    structure,
    volatility,
    supportLevels,
    resistanceLevels
  );
  const riskFlags = buildRiskFlags(trend, volatility, structure);
  const supportLevel = supportLevels.length ? supportLevels[0].price : null;
  const resistanceLevel = resistanceLevels.length ? resistanceLevels[0].price : null;

  const explanation = {
    title: `${symbol} ${direction} setup`,
    detail: `This ${mode.toLowerCase()} opportunity was generated from the current market state and does not constitute a trade recommendation.`,
    evidence: reasons,
  };

  return {
    symbol,
    timeframe,
    direction,
    score,
    confidence,
    reasons,
    riskFlags,
    supportLevel,
    resistanceLevel,
    explanation,
    mode,
    source,
    dataStatus,
  };
}

export function scanOpportunitySet(
  entries: Array<{ symbol: string; state: Partial<MarketState> | null; mode: TradingMode }>,
  filters: OpportunityFilters = defaultOpportunityFilters
): OpportunityRecord[] {
  return entries
    .map(({ symbol, state, mode }) => {
      const normalizedState = state ? { ...state, symbol: state.symbol ?? symbol } : null;
      const opportunity = buildOpportunityFromMarketState(normalizedState, mode, filters);
      return opportunity;
    })
    .filter((opportunity) => opportunity.score >= filters.minimumScore)
    .filter((opportunity) => opportunity.confidence >= filters.minimumConfidence)
    .sort((left, right) => right.score - left.score);
}

export function deriveCurrencyBias(currencyStrength: Array<{ currency: string; label: CurrencyStrengthLevel }>) {
  const strong = currencyStrength.filter((entry) => entry.label === CurrencyStrengthLevel.STRONG).map((entry) => entry.currency);
  const weak = currencyStrength.filter((entry) => entry.label === CurrencyStrengthLevel.WEAK).map((entry) => entry.currency);

  return {
    strong,
    weak,
    summary: strong.length || weak.length ? `${strong.join(', ') || 'none'} vs ${weak.join(', ') || 'none'}` : 'No clear currency bias.',
  };
}
