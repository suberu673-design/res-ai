'use client';

import React, { useEffect, useState } from 'react';
import {
  TradingMode,
  getTradingModeConfiguration,
} from '@forex-platform/types';

const MODE_OPTIONS: Array<{
  value: TradingMode;
  label: string;
  emoji: string;
}> = [
  { value: TradingMode.SCALPING, label: 'Scalping', emoji: '⚡' },
  { value: TradingMode.INTRADAY, label: 'Intraday', emoji: '📊' },
  { value: TradingMode.SHORT_TERM, label: 'Short-Term', emoji: '📈' },
  { value: TradingMode.SWING, label: 'Swing', emoji: '🌊' },
  { value: TradingMode.POSITION, label: 'Position', emoji: '🏦' },
];

const STORAGE_KEY = 'forex-platform.trading-mode';

export function TradingModeSelector() {
  const [selectedMode, setSelectedMode] = useState<TradingMode>(
    TradingMode.SWING
  );

  useEffect(() => {
    const savedMode = window.localStorage.getItem(STORAGE_KEY);
    if (
      savedMode &&
      Object.values(TradingMode).includes(savedMode as TradingMode)
    ) {
      setSelectedMode(savedMode as TradingMode);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, selectedMode);
  }, [selectedMode]);

  const config = getTradingModeConfiguration(selectedMode);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Trading Mode</h2>
          <p className="mt-1 text-sm text-slate-400">
            Operational constraints and analytical priorities only.
          </p>
        </div>
        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-300">
          Local Setting
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {MODE_OPTIONS.map((mode) => {
          const isActive = selectedMode === mode.value;
          const modeConfig = getTradingModeConfiguration(mode.value);

          return (
            <button
              key={mode.value}
              type="button"
              onClick={() => setSelectedMode(mode.value)}
              className={`rounded-xl border p-3 text-left transition ${
                isActive
                  ? 'border-sky-500 bg-sky-500/10 text-sky-100 shadow-[0_0_0_1px_rgba(14,165,233,0.4)]'
                  : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500 hover:bg-slate-800'
              }`}
            >
              <div className="text-lg">{mode.emoji}</div>
              <div className="mt-2 font-semibold">{mode.label}</div>
              <div className="mt-1 text-xs text-slate-400">
                {modeConfig.typicalHoldingPeriod}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Selected mode
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-100">
            {config.name}
          </div>
          <p className="mt-3 text-sm text-slate-300">{config.description}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Primary timeframes
              </div>
              <div className="mt-2 text-sm text-slate-200">
                {config.primaryTimeframes.join(', ')}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Holding period
              </div>
              <div className="mt-2 text-sm text-slate-200">
                {config.typicalHoldingPeriod}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Trade frequency
              </div>
              <div className="mt-2 text-sm text-slate-200">
                {config.maxTradeFrequency}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Risk profile
              </div>
              <div className="mt-2 text-sm text-slate-200">
                {config.riskProfile}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Analysis priorities
          </div>
          <ul className="mt-3 space-y-2">
            {config.analysisPriorities.map((priority) => (
              <li
                key={priority}
                className="flex items-center gap-2 text-sm text-slate-200"
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400" />
                {priority}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
