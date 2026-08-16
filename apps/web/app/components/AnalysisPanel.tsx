'use client';

import React from 'react';

interface AnalysisPanelProps {
  pair: string;
  direction: 'LONG' | 'SHORT';
  confidence: number;
  strategy: string;
  tradingStyle: string;
  entryZone: string;
  stop: string;
  target: string;
  riskReward: string;
  why: string;
  risks: string[];
  invalidation: string[];
  onClose?: () => void;
}

export function AnalysisPanel({
  pair,
  direction,
  confidence,
  strategy,
  tradingStyle,
  entryZone,
  stop,
  target,
  riskReward,
  why,
  risks,
  invalidation,
  onClose,
}: AnalysisPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-xl shadow-slate-950/40">
      <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Demo analysis
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-50">{pair}</h3>
          <div className="mt-2 inline-flex rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-300">
            {direction}
          </div>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close analysis panel"
            className="rounded border border-slate-700 px-2 py-1 text-sm text-slate-300 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
          >
            Close
          </button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Confidence
          </div>
          <div className="mt-2 text-2xl font-semibold text-emerald-300">
            {confidence}%
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Strategy
          </div>
          <div className="mt-2 text-lg font-medium text-slate-100">
            {strategy}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Trading Style
          </div>
          <div className="mt-2 text-lg font-medium text-slate-100">
            {tradingStyle}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Risk/Reward
          </div>
          <div className="mt-2 text-lg font-medium text-slate-100">
            {riskReward}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Entry Zone
          </div>
          <div className="mt-2 text-base font-medium text-slate-100">
            {entryZone}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Stop
          </div>
          <div className="mt-2 text-base font-medium text-slate-100">
            {stop}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Target
          </div>
          <div className="mt-2 text-base font-medium text-slate-100">
            {target}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            Why AI likes this setup
          </h4>
          <p className="mt-3 text-sm leading-6 text-slate-300">{why}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            Risks
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {risks.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            Invalidation
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {invalidation.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
