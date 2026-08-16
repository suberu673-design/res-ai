import type { MarketCandle, MarketTimeframe } from '@forex-platform/types';
import {
  CurrencyStrengthEntry,
  CurrencyStrengthLevel,
  IndicatorSnapshot,
  MarketState,
  SupportResistanceLevel,
  MarketStructureType,
  MarketTrend,
  MomentumStrength,
  VolatilityRegime,
  SupportResistanceType,
} from '@forex-platform/types';

export type CandleLike = Partial<
  Pick<MarketCandle, 'open' | 'timestamp' | 'timeframe' | 'source'>
> &
  Pick<MarketCandle, 'high' | 'low' | 'close'>;

export type TrendInput = {
  latestClose: number;
  ema20?: number | null;
  ema50?: number | null;
  ema200?: number | null;
  recentHigh?: number | null;
  recentLow?: number | null;
  marketStructure?: MarketStructureType | string;
};

export type MomentumInput = {
  rsi?: number | null;
  macd?: number | null;
  signal?: number | null;
  roc?: number | null;
};

export type AnalysisDataStatus =
  'ok' | 'insufficient_data' | 'no_data' | 'error';

export interface AnalyzePairInput {
  symbol: string;
  timeframe: MarketTimeframe | string;
  candles: CandleLike[];
  source?: string;
  dataStatus?: AnalysisDataStatus;
  quote?: number | null;
}

const pricePrecision = 8;

function finiteNumber(
  value: number | null | undefined,
  fallback: number | null = null
): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Number(value.toFixed(pricePrecision));
}

function average(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function calculateSMA(values: number[], period: number): number | null {
  if (!Number.isInteger(period) || period <= 0 || values.length < period) {
    return null;
  }
  const slice = values.slice(-period);
  const result = average(slice);
  return result === null ? null : finiteNumber(result);
}

export function calculateEMA(values: number[], period: number): number | null {
  if (!Number.isInteger(period) || period <= 0 || values.length === 0) {
    return null;
  }
  if (values.length < period) {
    return null;
  }

  const multiplier = 2 / (period + 1);
  let ema = values[0];
  for (let index = 1; index < values.length; index += 1) {
    ema = (values[index] - ema) * multiplier + ema;
  }
  return finiteNumber(ema);
}

export function calculateRSI(values: number[], period = 14): number | null {
  if (!Array.isArray(values) || values.length <= period) {
    return null;
  }

  const deltas = values.slice(1).map((value, index) => value - values[index]);
  let gains = 0;
  let losses = 0;

  for (let index = 0; index < period; index += 1) {
    const delta = deltas[index];
    if (delta >= 0) {
      gains += delta;
    } else {
      losses += Math.abs(delta);
    }
  }

  let averageGain = gains / period;
  let averageLoss = losses / period;

  for (let index = period; index < deltas.length; index += 1) {
    const delta = deltas[index];
    averageGain = (averageGain * (period - 1) + Math.max(delta, 0)) / period;
    averageLoss = (averageLoss * (period - 1) + Math.max(-delta, 0)) / period;
  }

  if (averageLoss === 0) {
    return 100;
  }
  if (averageGain === 0) {
    return 0;
  }

  const relativeStrength = averageGain / averageLoss;
  const rsi = 100 - 100 / (1 + relativeStrength);
  return finiteNumber(Math.min(100, Math.max(0, rsi)));
}

export function calculateMACD(
  values: number[],
  fast = 12,
  slow = 26,
  signal = 9
): {
  macd: number | null;
  signal: number | null;
  histogram: number | null;
} {
  if (values.length === 0) {
    return { macd: null, signal: null, histogram: null };
  }

  const effectiveSlow = Math.min(slow, values.length);
  const effectiveFast = Math.min(fast, values.length);
  if (effectiveFast <= 1 || effectiveSlow <= 1) {
    return { macd: null, signal: null, histogram: null };
  }

  const series = values.slice(-effectiveSlow);
  const fastEma = calculateEMA(series, effectiveFast);
  const slowEma = calculateEMA(series, effectiveSlow);
  if (fastEma === null || slowEma === null) {
    return { macd: null, signal: null, histogram: null };
  }

  const macdValue = fastEma - slowEma;
  const macdSeries = series
    .map((value, index, all) => {
      const fastWindow = all.slice(
        Math.max(0, index - effectiveFast + 1),
        index + 1
      );
      const slowWindow = all.slice(
        Math.max(0, index - effectiveSlow + 1),
        index + 1
      );
      const f = calculateEMA(
        fastWindow,
        Math.min(effectiveFast, fastWindow.length)
      );
      const s = calculateEMA(
        slowWindow,
        Math.min(effectiveSlow, slowWindow.length)
      );
      if (f === null || s === null) {
        return null;
      }
      return f - s;
    })
    .filter((value): value is number => value !== null);

  const macd = macdSeries.at(-1) ?? macdValue;
  const signalValue =
    macdSeries.length >= Math.min(signal, macdSeries.length)
      ? calculateEMA(macdSeries, Math.min(signal, macdSeries.length))
      : null;
  const histogram =
    macd !== null && signalValue !== null ? macd - signalValue : null;

  return {
    macd: finiteNumber(macd),
    signal: finiteNumber(signalValue),
    histogram: finiteNumber(histogram),
  };
}

export function calculateATR(
  candles: CandleLike[],
  period = 14
): number | null {
  if (candles.length < period + 1) {
    return null;
  }

  const trueRanges: number[] = [];
  for (let index = 1; index < candles.length; index += 1) {
    const previous = candles[index - 1];
    const current = candles[index];
    const totalRange = Math.max(
      current.high - current.low,
      Math.abs(current.high - previous.close),
      Math.abs(current.low - previous.close)
    );
    trueRanges.push(totalRange);
  }

  const lastValues = trueRanges.slice(-period);
  const averageTR = average(lastValues);
  return averageTR === null ? null : finiteNumber(averageTR);
}

export function calculateBollingerBands(
  values: number[],
  period = 20,
  standardDeviations = 2
): {
  upper: number | null;
  middle: number | null;
  lower: number | null;
  stdDev: number | null;
} | null {
  if (!Number.isInteger(period) || period <= 0 || values.length < period) {
    return null;
  }

  const slice = values.slice(-period);
  const middle = calculateSMA(slice, period);
  if (middle === null) {
    return null;
  }

  const variance = average(slice.map((value) => Math.pow(value - middle, 2)));
  const stdDev = variance === null ? null : Math.sqrt(variance);
  if (stdDev === null) {
    return null;
  }

  return {
    upper: finiteNumber(middle + standardDeviations * stdDev),
    middle: finiteNumber(middle),
    lower: finiteNumber(middle - standardDeviations * stdDev),
    stdDev: finiteNumber(stdDev),
  };
}

export function calculateADX(
  candles: CandleLike[],
  period = 14
): number | null {
  if (candles.length < period * 2) {
    return null;
  }

  const plusDM: number[] = [];
  const minusDM: number[] = [];
  const trueRanges: number[] = [];

  for (let index = 1; index < candles.length; index += 1) {
    const previous = candles[index - 1];
    const current = candles[index];
    const upMove = current.high - previous.high;
    const downMove = previous.low - current.low;
    const plus = upMove > downMove && upMove > 0 ? upMove : 0;
    const minus = downMove > upMove && downMove > 0 ? downMove : 0;
    plusDM.push(plus);
    minusDM.push(minus);
    trueRanges.push(
      Math.max(
        current.high - current.low,
        Math.abs(current.high - previous.close),
        Math.abs(current.low - previous.close)
      )
    );
  }

  if (plusDM.length < period) {
    return null;
  }

  let prevPlus = plusDM
    .slice(0, period)
    .reduce((total, value) => total + value, 0);
  let prevMinus = minusDM
    .slice(0, period)
    .reduce((total, value) => total + value, 0);
  let prevTr = trueRanges
    .slice(0, period)
    .reduce((total, value) => total + value, 0);

  const dxSeries: number[] = [];
  for (let index = period; index < plusDM.length; index += 1) {
    const plusValue = plusDM[index];
    const minusValue = minusDM[index];
    const trValue = trueRanges[index];

    prevPlus = prevPlus - prevPlus / period + plusValue;
    prevMinus = prevMinus - prevMinus / period + minusValue;
    prevTr = prevTr - prevTr / period + trValue;

    const diPlus = prevTr === 0 ? 0 : (100 * prevPlus) / prevTr;
    const diMinus = prevTr === 0 ? 0 : (100 * prevMinus) / prevTr;
    const denominator = diPlus + diMinus;
    const dx =
      denominator === 0 ? 0 : (100 * Math.abs(diPlus - diMinus)) / denominator;
    dxSeries.push(dx);
  }

  if (dxSeries.length === 0) {
    return null;
  }

  const adx = calculateSMA(
    dxSeries.slice(-period),
    Math.min(period, dxSeries.length)
  );
  return adx === null ? null : finiteNumber(adx);
}

export function calculateROC(values: number[], period = 10): number | null {
  if (values.length <= period) {
    return null;
  }
  const current = values.at(-1);
  const previous = values.at(-(period + 1));
  if (current === undefined || previous === undefined || previous === 0) {
    return null;
  }
  return finiteNumber(((current - previous) / previous) * 100);
}

export function classifyTrend(input: TrendInput): MarketTrend {
  const latestClose = finiteNumber(input.latestClose);
  const ema20 = finiteNumber(input.ema20);
  const ema50 = finiteNumber(input.ema50);
  const ema200 = finiteNumber(input.ema200);
  const recentHigh = finiteNumber(input.recentHigh);
  const recentLow = finiteNumber(input.recentLow);

  if (
    latestClose === null ||
    ema20 === null ||
    ema50 === null ||
    ema200 === null
  ) {
    return MarketTrend.UNKNOWN;
  }

  const priceAboveShort = latestClose > ema20;
  const shortAboveMid = ema20 > ema50;
  const midAboveLong = ema50 > ema200;
  const structure = String(input.marketStructure ?? '').toUpperCase();

  if (
    (priceAboveShort && shortAboveMid && midAboveLong) ||
    structure.includes('HIGHER') ||
    structure.includes('BREAKOUT')
  ) {
    return MarketTrend.BULLISH;
  }

  if (
    (latestClose < ema20 && ema20 < ema50 && ema50 < ema200) ||
    structure.includes('LOWER') ||
    structure.includes('BREAKDOWN')
  ) {
    return MarketTrend.BEARISH;
  }

  if (recentHigh !== null && recentLow !== null) {
    const spread = recentHigh - recentLow;
    if (spread > 0 && Math.abs(latestClose - ema20) <= spread * 0.1) {
      return MarketTrend.SIDEWAYS;
    }
  }

  return MarketTrend.UNKNOWN;
}

export function classifyMomentum(input: MomentumInput): MomentumStrength {
  const rsi = finiteNumber(input.rsi ?? null);
  const macd = finiteNumber(input.macd ?? null);
  const signal = finiteNumber(input.signal ?? null);
  const roc = finiteNumber(input.roc ?? null);

  if (rsi === null || macd === null || signal === null || roc === null) {
    return MomentumStrength.NEUTRAL;
  }

  const macdDelta = macd - signal;
  if (rsi >= 70 || (rsi >= 60 && macdDelta > 0 && roc > 0.01)) {
    return MomentumStrength.STRONG_BULLISH;
  }
  if (rsi > 55 || (macdDelta > 0 && roc > 0)) {
    return MomentumStrength.BULLISH;
  }
  if (rsi <= 30 || (rsi <= 40 && macdDelta < 0 && roc < -0.01)) {
    return MomentumStrength.STRONG_BEARISH;
  }
  if (rsi < 45 || (macdDelta < 0 && roc < 0)) {
    return MomentumStrength.BEARISH;
  }
  return MomentumStrength.NEUTRAL;
}

export function classifyVolatility(normalizedAtr: number): VolatilityRegime {
  const value = finiteNumber(normalizedAtr);
  if (value === null) {
    return VolatilityRegime.NORMAL;
  }
  if (value < 0.0006) return VolatilityRegime.LOW;
  if (value < 0.0012) return VolatilityRegime.NORMAL;
  if (value < 0.0025) return VolatilityRegime.HIGH;
  return VolatilityRegime.EXTREME;
}

export function detectMarketStructure(
  candles: CandleLike[]
): MarketStructureType {
  if (candles.length < 5) {
    return MarketStructureType.UNKNOWN;
  }

  const recent = candles.slice(-5);
  const currentClose = recent.at(-1)?.close ?? 0;
  const previousHigh = recent.at(-2)?.high ?? recent.at(-1)?.high ?? 0;
  const previousLow = recent.at(-2)?.low ?? recent.at(-1)?.low ?? 0;
  const lastHigh = recent.at(-1)?.high ?? 0;
  const lastLow = recent.at(-1)?.low ?? 0;

  const earlierHighs = recent.slice(0, -1).map((candle) => candle.high);
  const earlierLows = recent.slice(0, -1).map((candle) => candle.low);
  const recentHighPeak = Math.max(...earlierHighs);
  const recentLowTrough = Math.min(...earlierLows);

  if (currentClose > recentHighPeak && lastHigh > previousHigh) {
    return MarketStructureType.BREAKOUT;
  }
  if (currentClose < recentLowTrough && lastLow < previousLow) {
    return MarketStructureType.BREAKDOWN;
  }

  if (lastHigh > previousHigh && lastLow > previousLow) {
    return MarketStructureType.HIGHER_HIGHS;
  }
  if (lastHigh < previousHigh && lastLow < previousLow) {
    return MarketStructureType.LOWER_LOWS;
  }
  if (lastHigh > previousHigh && lastLow <= previousLow) {
    return MarketStructureType.HIGHER_HIGHS;
  }
  if (lastHigh <= previousHigh && lastLow < previousLow) {
    return MarketStructureType.LOWER_HIGHS;
  }

  const totalRange = Math.abs(lastHigh - lastLow);
  const priorRange = Math.abs(previousHigh - previousLow);
  if (totalRange > 0 && Math.abs(totalRange - priorRange) < totalRange * 0.05) {
    return MarketStructureType.RANGE;
  }

  return MarketStructureType.UNKNOWN;
}

function dedupeLevels(
  levels: SupportResistanceLevel[]
): SupportResistanceLevel[] {
  const deduped: SupportResistanceLevel[] = [];
  for (const level of levels) {
    const existing = deduped.find(
      (candidate) => Math.abs(candidate.price - level.price) <= 0.0005
    );
    if (!existing) {
      deduped.push(level);
    } else {
      existing.strength = Math.max(existing.strength, level.strength);
    }
  }
  return deduped.sort((left, right) => left.price - right.price);
}

export function detectSupportResistance(candles: CandleLike[]): {
  supportLevels: SupportResistanceLevel[];
  resistanceLevels: SupportResistanceLevel[];
} {
  if (candles.length < 5) {
    return { supportLevels: [], resistanceLevels: [] };
  }

  const maxLevels = 3;
  const supportMap = new Map<number, number>();
  const resistanceMap = new Map<number, number>();

  for (const candle of candles.slice(-30)) {
    const lowBucket = Math.round(candle.low / 0.0005) * 0.0005;
    const highBucket = Math.round(candle.high / 0.0005) * 0.0005;
    supportMap.set(lowBucket, (supportMap.get(lowBucket) ?? 0) + 1);
    resistanceMap.set(highBucket, (resistanceMap.get(highBucket) ?? 0) + 1);
  }

  const supportLevels = Array.from(supportMap.entries())
    .map(([price, count]) => ({
      price: Number(price.toFixed(5)),
      type: SupportResistanceType.SUPPORT,
      strength: Math.min(1, count / 3),
      source: 'swing',
    }))
    .sort((left, right) => left.price - right.price)
    .slice(0, maxLevels);

  const resistanceLevels = Array.from(resistanceMap.entries())
    .map(([price, count]) => ({
      price: Number(price.toFixed(5)),
      type: SupportResistanceType.RESISTANCE,
      strength: Math.min(1, count / 3),
      source: 'swing',
    }))
    .sort((left, right) => right.price - left.price)
    .slice(0, maxLevels);

  return {
    supportLevels: dedupeLevels(supportLevels),
    resistanceLevels: dedupeLevels(resistanceLevels),
  };
}

export function deriveCurrencyStrength(
  pairValues: Record<string, number>
): CurrencyStrengthEntry[] {
  const scoreTable: Record<string, number> = {
    USD: 0,
    EUR: 0,
    GBP: 0,
    JPY: 0,
    CHF: 0,
    AUD: 0,
    CAD: 0,
    NZD: 0,
  };

  const keys = Object.keys(pairValues);
  for (const pair of keys) {
    const value = finiteNumber(pairValues[pair]);
    if (value === null) continue;

    if (pair === 'EURUSD') {
      scoreTable.EUR += value;
      scoreTable.USD -= value;
    } else if (pair === 'GBPUSD') {
      scoreTable.GBP += value;
      scoreTable.USD -= value;
    } else if (pair === 'USDJPY') {
      scoreTable.USD += value / 100;
      scoreTable.JPY -= value / 100;
    } else if (pair === 'USDCHF') {
      scoreTable.USD += value;
      scoreTable.CHF -= value;
    } else if (pair === 'AUDUSD') {
      scoreTable.AUD += value;
      scoreTable.USD -= value;
    } else if (pair === 'USDCAD') {
      scoreTable.USD += value;
      scoreTable.CAD -= value;
    } else if (pair === 'NZDUSD') {
      scoreTable.NZD += value;
      scoreTable.USD -= value;
    } else if (pair === 'EURGBP') {
      scoreTable.EUR += value;
      scoreTable.GBP -= value;
    } else if (pair === 'EURJPY') {
      scoreTable.EUR += value / 100;
      scoreTable.JPY -= value / 100;
    } else if (pair === 'GBPJPY') {
      scoreTable.GBP += value / 100;
      scoreTable.JPY -= value / 100;
    }
  }

  return Object.entries(scoreTable)
    .filter(([currency]) => currency in scoreTable)
    .map(([currency, score]) => {
      let label: CurrencyStrengthEntry['label'] = CurrencyStrengthLevel.NEUTRAL;
      if (score > 1) label = CurrencyStrengthLevel.STRONG;
      else if (score > 0.2) label = CurrencyStrengthLevel.MODERATE;
      else if (score < -1) label = CurrencyStrengthLevel.WEAK;
      else if (score < -0.2) label = CurrencyStrengthLevel.WEAK;
      return {
        currency,
        score: Number(score.toFixed(4)),
        label,
      };
    });
}

export class MarketIntelligenceService {
  private readonly defaultRsiPeriod = 14;

  analyzePair(input: AnalyzePairInput): MarketState {
    return this.analyzeCandles({
      symbol: input.symbol,
      timeframe: input.timeframe,
      candles: input.candles,
      source: input.source ?? 'mock',
      dataStatus: input.dataStatus ?? (input.candles.length ? 'ok' : 'no_data'),
      quote: input.quote ?? null,
    });
  }

  analyzeCandles(input: AnalyzePairInput): MarketState {
    const normalizedSymbol = String(input.symbol ?? '')
      .trim()
      .toUpperCase();
    const candles = Array.isArray(input.candles) ? input.candles : [];

    if (!candles.length) {
      return {
        symbol: normalizedSymbol,
        timeframe: String(input.timeframe ?? '1h'),
        timestamp: new Date(),
        trend: MarketTrend.UNKNOWN,
        momentum: MomentumStrength.NEUTRAL,
        volatility: VolatilityRegime.NORMAL,
        marketStructure: MarketStructureType.UNKNOWN,
        supportLevels: [],
        resistanceLevels: [],
        indicators: {
          rsi: null,
          ema20: null,
          ema50: null,
          ema100: null,
          ema200: null,
          macd: null,
          signal: null,
          histogram: null,
          atr: null,
          adx: null,
          roc: null,
          bollingerBands: null,
          dataStatus: 'insufficient_data',
          source: input.source ?? 'mock',
          valid: false,
        },
        source: input.source ?? 'mock',
        dataStatus: 'no_data',
      };
    }

    const closes = candles
      .map((candle) => candle.close)
      .filter((value) => Number.isFinite(value));
    const ema20 = calculateEMA(closes, 20);
    const ema50 = calculateEMA(closes, 50);
    const ema100 = calculateEMA(closes, 100);
    const ema200 = calculateEMA(closes, 200);
    const rsi = calculateRSI(closes, this.defaultRsiPeriod);
    const macd = calculateMACD(closes, 12, 26, 9);
    const atr = calculateATR(candles, 14);
    const bollinger = calculateBollingerBands(closes, 20, 2);
    const adx = calculateADX(candles, 14);
    const roc = calculateROC(closes, 10);
    const latestClose = closes.at(-1) ?? null;
    const dataStatus = closes.length >= 50 ? 'ok' : 'insufficient_data';
    const structure = detectMarketStructure(candles);
    const supportResistance = detectSupportResistance(candles);
    const normalizedAtr = latestClose && atr ? atr / latestClose : 0;
    const trend = classifyTrend({
      latestClose: latestClose ?? 0,
      ema20,
      ema50,
      ema200,
      recentHigh: candles
        .slice(-20)
        .reduce(
          (max, candle) => Math.max(max, candle.high),
          Number.NEGATIVE_INFINITY
        ),
      recentLow: candles
        .slice(-20)
        .reduce(
          (min, candle) => Math.min(min, candle.low),
          Number.POSITIVE_INFINITY
        ),
      marketStructure: structure,
    });
    const momentum = classifyMomentum({
      rsi: rsi ?? 50,
      macd: macd.macd ?? 0,
      signal: macd.signal ?? 0,
      roc: roc ?? 0,
    });
    const volatility = classifyVolatility(normalizedAtr);
    const pairUniverse: Record<string, number> = {};
    if (latestClose) {
      pairUniverse[normalizedSymbol] = latestClose;
    }

    const indicators: IndicatorSnapshot = {
      rsi: rsi ?? null,
      ema20: ema20 ?? null,
      ema50: ema50 ?? null,
      ema100: ema100 ?? null,
      ema200: ema200 ?? null,
      macd: macd.macd ?? null,
      signal: macd.signal ?? null,
      histogram: macd.histogram ?? null,
      atr: atr ?? null,
      adx: adx ?? null,
      roc: roc ?? null,
      bollingerBands: bollinger,
      source: input.source ?? 'mock',
      dataStatus,
      valid: dataStatus === 'ok',
    };

    const state: MarketState = {
      symbol: normalizedSymbol,
      timeframe: String(input.timeframe ?? '1h'),
      timestamp: new Date(),
      trend,
      momentum,
      volatility,
      marketStructure: structure,
      supportLevels: supportResistance.supportLevels,
      resistanceLevels: supportResistance.resistanceLevels,
      indicators,
      source: input.source ?? 'mock',
      dataStatus,
      currencyStrength: deriveCurrencyStrength(pairUniverse),
    };

    return state;
  }
}

export { MarketStructureType, MarketTrend, MomentumStrength, VolatilityRegime };
