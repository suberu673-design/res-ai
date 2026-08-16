import React from 'react';
import { TradeStatus } from '@forex-platform/types';
import { positionRows } from '../../lib/demo-data';

export function PositionTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
      <table className="min-w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-900 text-xs uppercase tracking-[0.18em] text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">Pair</th>
            <th className="px-4 py-3 font-medium">Direction</th>
            <th className="px-4 py-3 font-medium">Entry</th>
            <th className="px-4 py-3 font-medium">Current</th>
            <th className="px-4 py-3 font-medium">Unrealized P&L</th>
            <th className="px-4 py-3 font-medium">R Multiple</th>
            <th className="px-4 py-3 font-medium">Strategy</th>
            <th className="px-4 py-3 font-medium">Style</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {positionRows.map((row) => (
            <tr key={row.pair} className="border-t border-slate-800">
              <td className="px-4 py-3 font-medium text-slate-100">
                {row.pair}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${row.direction === 'LONG' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}
                >
                  {row.direction}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-200">{row.entry}</td>
              <td className="px-4 py-3 text-slate-200">{row.current}</td>
              <td
                className={`px-4 py-3 font-medium ${row.pnl.startsWith('+') ? 'text-emerald-300' : 'text-rose-300'}`}
              >
                {row.pnl}
              </td>
              <td className="px-4 py-3 text-slate-200">{row.rMultiple}</td>
              <td className="px-4 py-3 text-slate-200">{row.strategy}</td>
              <td className="px-4 py-3 text-slate-200">{row.tradingStyle}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${row.status === TradeStatus.OPEN ? 'bg-amber-500/10 text-amber-300' : 'bg-slate-500/10 text-slate-300'}`}
                >
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
