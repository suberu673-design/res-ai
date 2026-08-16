'use client';

import { useEffect, useState } from 'react';

type MarketAnalysisResponse = {
  symbol: string;
  timeframe: string;
  timestamp: string;
  trend: string;
  momentum: string;
  volatility: string;
  marketStructure: string;
  supportLevels: Array<{ price: number; type: string; strength: number; source: string }>;
  resistanceLevels: Array<{ price: number; type: string; strength: number; source: string }>;
  indicators: {
    rsi: number | null;
    ema20: number | null;
    ema50: number | null;
    ema200: number | null;
    atr: number | null;
    adx: number | null;
    macd: number | null;
    signal: number | null;
    histogram: number | null;
    roc: number | null;
    bollingerBands?: { upper: number | null; middle: number | null; lower: number | null; stdDev: number | null } | null;
  };
  source: string;
  sourceMode?: 'LIVE' | 'MOCK';
  mode?: 'LIVE' | 'MOCK';
  dataStatus: string;
  currencyStrength?: Array<{ currency: string; score: number; label: string }>;
};

interface MarketIntelligencePanelProps {
  pair: string;
}

const pairOptions = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'EURGBP'];

export function MarketIntelligencePanel({ pair }: MarketIntelligencePanelProps) {
  const [selectedPair, setSelectedPair] = useState(pair);
  const [analysis, setAnalysis] = useState<MarketAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedPair(pair);
  }, [pair]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/analysis/${selectedPair}?timeframe=1h`, {
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Analysis unavailable');
        }

        const payload = await response.json();
        setAnalysis(payload);
      } catch (requestError) {
        if ((requestError as Error).name !== 'AbortError') {
          setError('Unable to load market intelligence.');
          setAnalysis(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
    return () => controller.abort();
  }, [selectedPair]);

  const marketMode = analysis?.sourceMode ?? analysis?.mode ?? 'MOCK';
  const isMock = marketMode === 'MOCK';

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Market Intelligence</h2>
          <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
            {isMock ? 'Market Data: MOCK' : 'Market Data: LIVE'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs uppercase tracking-[0.18em] text-slate-400" htmlFor="pair-select">Pair</label>
          <select
            id="pair-select"
            value={selectedPair}
            onChange={(event) => setSelectedPair(event.target.value)}
            className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-100"
          >
            {pairOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">Loading market intelligence…</div>
      ) : error ? (
        <div className="rounded border border-rose-700 bg-rose-900/20 p-4 text-sm text-rose-200">{error}</div>
      ) : !analysis ? (
        <div className="rounded border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">No market intelligence available.</div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{analysis.symbol}</div>
                <div className="mt-2 text-3xl font-semibold text-slate-50">{analysis.timeframe}</div>
              </div>
              <div className="text-right text-xs uppercase tracking-[0.18em] text-slate-400">
                <div>Analysis Source: {analysis.source}</div>
                <div className="mt-1 text-sky-300">Data Status: {analysis.dataStatus}</div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Trend</div>
              <div className="mt-2 text-xl font-semibold text-emerald-300">{analysis.trend}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Momentum</div>
              <div className="mt-2 text-xl font-semibold text-sky-300">{analysis.momentum}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Volatility</div>
              <div className="mt-2 text-xl font-semibold text-amber-300">{analysis.volatility}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Structure</div>
              <div className="mt-2 text-xl font-semibold text-violet-300">{analysis.marketStructure}</div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Indicators</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div><span className="text-slate-500">RSI</span><div className="text-lg font-medium text-slate-100">{analysis.indicators.rsi ?? 'n/a'}</div></div>
                <div><span className="text-slate-500">EMA 20</span><div className="text-lg font-medium text-slate-100">{analysis.indicators.ema20 ?? 'n/a'}</div></div>
                <div><span className="text-slate-500">EMA 50</span><div className="text-lg font-medium text-slate-100">{analysis.indicators.ema50 ?? 'n/a'}</div></div>
                <div><span className="text-slate-500">EMA 200</span><div className="text-lg font-medium text-slate-100">{analysis.indicators.ema200 ?? 'n/a'}</div></div>
                <div><span className="text-slate-500">ATR</span><div className="text-lg font-medium text-slate-100">{analysis.indicators.atr ?? 'n/a'}</div></div>
                <div><span className="text-slate-500">ADX</span><div className="text-lg font-medium text-slate-100">{analysis.indicators.adx ?? 'n/a'}</div></div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Levels</h3>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Support</div>
                  <div className="mt-2 text-sm text-slate-100">
                    {analysis.supportLevels.length ? analysis.supportLevels.map((level) => `${level.price.toFixed(5)} (${level.strength})`).join(', ') : 'n/a'}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Resistance</div>
                  <div className="mt-2 text-sm text-slate-100">
                    {analysis.resistanceLevels.length ? analysis.resistanceLevels.map((level) => `${level.price.toFixed(5)} (${level.strength})`).join(', ') : 'n/a'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {analysis.currencyStrength && analysis.currencyStrength.length ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Currency Strength</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {analysis.currencyStrength.map((entry) => (
                  <span key={entry.currency} className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-200">
                    {entry.currency}: {entry.label} ({entry.score})
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
