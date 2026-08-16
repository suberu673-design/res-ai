'use client';

import React from 'react';
import { TradeDirection } from '@forex-platform/types';
import { opportunityRows } from '../../lib/demo-data';

interface OpportunityTableProps {
  onViewAnalysis?: (pair: string) => void;
}

export function OpportunityTable({ onViewAnalysis }: OpportunityTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
      <table className="min-w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-900 text-xs uppercase tracking-[0.18em] text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">Pair</th>
            <th className="px-4 py-3 font-medium">Direction</th>
            <th className="px-4 py-3 font-medium">Score</th>
            <th className="px-4 py-3 font-medium">Style</th>
            <th className="px-4 py-3 font-medium">Strategy</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {opportunityRows.map((row) => (
            <tr key={row.pair} className="border-t border-slate-800">
              <td className="px-4 py-3 font-medium text-slate-100">
                {row.pair}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    row.direction === TradeDirection.LONG
                      ? 'bg-emerald-500/10 text-emerald-300'
                      : 'bg-rose-500/10 text-rose-300'
                  }`}
                >
                  {row.direction}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="font-semibold text-sky-300">
                  {row.score}/100
                </span>
              </td>
              <td className="px-4 py-3 text-slate-200">{row.tradingStyle}</td>
              <td className="px-4 py-3 text-slate-200">{row.strategy}</td>
              <td className="px-4 py-3 text-slate-200">{row.status}</td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onViewAnalysis?.(row.pair)}
                  className="rounded border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-300 transition hover:border-sky-400 hover:bg-sky-500/20 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                >
                  View Analysis
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
