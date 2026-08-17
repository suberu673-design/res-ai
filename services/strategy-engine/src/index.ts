import {
  MarketTrend,
  MomentumStrength,
  StrategyEvaluationInput,
  StrategyEvaluationResult,
  StrategySignal,
  StrategySignalDirection,
} from '@forex-platform/types';

export const TREND_FOLLOWING_STRATEGY_ID = 'trend-following';
export const TREND_FOLLOWING_STRATEGY_VERSION = 'v1.0.0';
export const TREND_FOLLOWING_STRATEGY_VERSION_ID = `${TREND_FOLLOWING_STRATEGY_ID}-${TREND_FOLLOWING_STRATEGY_VERSION}`;

function getStrategyIdentity(input: StrategyEvaluationInput) {
  const strategyId =
    input.strategyVersion?.strategyId ?? input.strategyId ?? TREND_FOLLOWING_STRATEGY_ID;

  const explicitStrategyVersionId = input.strategyVersion?.id ?? null;
  const versionValue = input.strategyVersion?.version ?? TREND_FOLLOWING_STRATEGY_VERSION;
  const majorVersion = versionValue.replace(/^v/i, '').split('.')[0] ?? '1';
  const generatedStrategyVersionId = `${strategyId}-v${majorVersion}`;

  return {
    strategyId,
    strategyVersionId:
      explicitStrategyVersionId ?? generatedStrategyVersionId ?? TREND_FOLLOWING_STRATEGY_VERSION_ID,
    strategyVersion: versionValue,
  };
}

function buildNoSignalResult(
  input: StrategyEvaluationInput,
  reason: string,
  strategyId: string,
  strategyVersionId: string | null,
  strategyVersion: string
): StrategyEvaluationResult {
  return {
    strategyId,
    strategyVersionId,
    symbol: input.symbol,
    timeframe: input.timeframe,
    tradingMode: input.tradingMode,
    producedSignal: false,
    signal: null,
    metadata: {
      strategyVersion,
      strategyParameters: input.parameters,
      tradingStyle: input.tradingStyle ?? null,
      status: 'NO_SIGNAL',
      deterministic: true,
      reason,
      marketStateSnapshot: input.marketState
        ? {
            symbol: input.marketState.symbol ?? input.symbol,
            timeframe: input.marketState.timeframe ?? input.timeframe,
            trend: input.marketState.trend ?? null,
            momentum: input.marketState.momentum ?? null,
            dataStatus: input.marketState.dataStatus ?? null,
          }
        : null,
    },
  };
}

function buildSignal(
  input: StrategyEvaluationInput,
  direction: StrategySignalDirection,
  strategyId: string,
  strategyVersionId: string | null,
  strategyVersion: string,
  rationale: string
): StrategySignal {
  const confidence =
    direction === StrategySignalDirection.LONG
      ? input.marketState?.momentum === MomentumStrength.STRONG_BULLISH
        ? 85
        : 74
      : input.marketState?.momentum === MomentumStrength.STRONG_BEARISH
        ? 85
        : 74;

  return {
    id: `${strategyId}-${input.symbol}-${input.timeframe}-${direction.toLowerCase()}`,
    symbol: input.symbol,
    timeframe: input.timeframe,
    direction,
    confidence,
    rationale: [rationale],
    strategyId,
    strategyVersionId,
    metadata: {
      strategyVersion,
      trend: input.marketState?.trend ?? null,
      momentum: input.marketState?.momentum ?? null,
      deterministic: true,
    },
  };
}

/**
 * Minimal deterministic trend-following strategy.
 * Long requires bullish trend + confirming bullish momentum.
 * Short requires bearish trend + confirming bearish momentum.
 * Any disagreement, neutral state, or insufficient market information produces NO_SIGNAL.
 */
export function evaluateStrategy(
  input: StrategyEvaluationInput
): StrategyEvaluationResult {
  const { strategyId, strategyVersionId, strategyVersion } = getStrategyIdentity(input);
  const marketState = input.marketState;

  if (!marketState) {
    return buildNoSignalResult(
      input,
      'Market state is unavailable; trend and momentum cannot be confirmed.',
      strategyId,
      strategyVersionId,
      strategyVersion
    );
  }

  const trend = marketState.trend;
  const momentum = marketState.momentum;

  if (
    !trend ||
    !momentum ||
    trend === MarketTrend.UNKNOWN ||
    trend === MarketTrend.SIDEWAYS ||
    momentum === MomentumStrength.NEUTRAL
  ) {
    return buildNoSignalResult(
      input,
      'Trend and momentum are neutral, unclear, or unavailable.',
      strategyId,
      strategyVersionId,
      strategyVersion
    );
  }

  const bullishConfirmation =
    trend === MarketTrend.BULLISH &&
    (momentum === MomentumStrength.BULLISH ||
      momentum === MomentumStrength.STRONG_BULLISH);

  const bearishConfirmation =
    trend === MarketTrend.BEARISH &&
    (momentum === MomentumStrength.BEARISH ||
      momentum === MomentumStrength.STRONG_BEARISH);

  if (bullishConfirmation) {
    const signal = buildSignal(
      input,
      StrategySignalDirection.LONG,
      strategyId,
      strategyVersionId,
      strategyVersion,
      'Trend and momentum confirm bullish conditions.'
    );

    return {
      strategyId,
      strategyVersionId,
      symbol: input.symbol,
      timeframe: input.timeframe,
      tradingMode: input.tradingMode,
      producedSignal: true,
      signal,
      metadata: {
        strategyVersion,
        strategyParameters: input.parameters,
        tradingStyle: input.tradingStyle ?? null,
        status: 'SIGNAL',
        deterministic: true,
        reason: 'Trend and momentum confirm bullish conditions.',
      },
    };
  }

  if (bearishConfirmation) {
    const signal = buildSignal(
      input,
      StrategySignalDirection.SHORT,
      strategyId,
      strategyVersionId,
      strategyVersion,
      'Trend and momentum confirm bearish conditions.'
    );

    return {
      strategyId,
      strategyVersionId,
      symbol: input.symbol,
      timeframe: input.timeframe,
      tradingMode: input.tradingMode,
      producedSignal: true,
      signal,
      metadata: {
        strategyVersion,
        strategyParameters: input.parameters,
        tradingStyle: input.tradingStyle ?? null,
        status: 'SIGNAL',
        deterministic: true,
        reason: 'Trend and momentum confirm bearish conditions.',
      },
    };
  }

  return buildNoSignalResult(
    input,
    'Trend and momentum do not confirm a decisive directional move.',
    strategyId,
    strategyVersionId,
    strategyVersion
  );
}

export default evaluateStrategy;
