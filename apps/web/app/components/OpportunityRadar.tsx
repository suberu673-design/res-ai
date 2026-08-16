'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { TradingMode } from '@forex-platform/types';

type OpportunityPayload = {
  symbol: string;
  timeframe: string;
  mode: string;
  score: number;
  confidence: number;
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  reasons: string[];
  riskFlags: string[];
  explanation: {
    title: string;
    detail: string;
    evidence: string[];
  };
  source: string;
  dataStatus: string;
};

export function OpportunityRadar() {
  const [selectedMode, setSelectedMode] = useState<TradingMode>(TradingMode.SWING);
  const [opportunities, setOpportunities] = useState<OpportunityPayload[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchOpportunities = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/scanner?mode=${selectedMode}&timeframe=4h&limit=5`,
          { cache: 'no-store', signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Unable to load opportunity scan');
        }

        const payload = await response.json();
        setOpportunities(payload.opportunities ?? []);
      } catch (requestError) {
        if ((requestError as Error).name !== 'AbortError') {
          setError('Unable to load updated opportunity scan.');
          setOpportunities([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
    return () => controller.abort();
  }, [selectedMode]);

  const modeSummary = useMemo(
    () =>
      selectedMode === TradingMode.SCALPING
        ? 'Fast execution focus'
        : selectedMode === TradingMode.POSITION
          ? 'Macro trend focus'
          : 'Structure and trend focus',
    [selectedMode]
  );

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 md:p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Opportunity Radar</h2>
          <p className="mt-1 text-sm text-slate-400">{modeSummary}</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[10px] uppercase tracking-[0.18em] text-slate-500" htmlFor="mode-select">
            Mode
          </label>
          <select
            id="mode-select"
            value={selectedMode}
            onChange={(event) => setSelectedMode(event.target.value as TradingMode)}
            className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-100"
          >
            {Object.values(TradingMode).map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
          Scanning markets for opportunities…
        </div>
      ) : error ? (
        <div className="rounded border border-rose-700 bg-rose-900/20 p-4 text-sm text-rose-200">
          {error}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="rounded border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
          No opportunities met the current filters.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {opportunities.map((opportunity) => (
            <article key={opportunity.symbol} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{opportunity.symbol}</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-50">{opportunity.direction}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Score</div>
                  <div className="mt-1 text-lg font-semibold text-sky-300">{opportunity.score}/100</div>
                </div>
              </div>

              <div className="mt-4 rounded border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-300">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-slate-500">
                  <span>Confidence</span>
                  <span>{opportunity.confidence}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                    style={{ width: `${opportunity.confidence}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <div>
                  <span className="font-medium text-slate-100">Title:</span> {opportunity.explanation.title}
                </div>
                <div>
                  <span className="font-medium text-slate-100">Why:</span> {opportunity.explanation.detail}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Reasons</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
                  {opportunity.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>

              {opportunity.riskFlags.length > 0 ? (
                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Risk flags</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-200">
                    {opportunity.riskFlags.map((flag) => (
                      <li key={flag}>{flag}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
