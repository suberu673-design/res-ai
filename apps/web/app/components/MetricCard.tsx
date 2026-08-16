import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  note: string;
  tone?: 'positive' | 'negative' | 'neutral' | 'warning';
}

const toneStyles = {
  positive: {
    value: 'text-emerald-300',
    border: 'border-emerald-500/20',
  },
  negative: {
    value: 'text-rose-300',
    border: 'border-rose-500/20',
  },
  neutral: {
    value: 'text-sky-300',
    border: 'border-slate-700',
  },
  warning: {
    value: 'text-amber-300',
    border: 'border-amber-500/20',
  },
};

export function MetricCard({
  label,
  value,
  note,
  tone = 'neutral',
}: MetricCardProps) {
  const styles = toneStyles[tone];

  return (
    <div
      className={`rounded-xl border bg-slate-900/70 p-4 shadow-sm shadow-slate-950/30 ${styles.border}`}
    >
      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className={`mt-3 text-2xl font-semibold ${styles.value}`}>
        {value}
      </div>
      <div className="mt-1 text-xs text-slate-400">{note}</div>
    </div>
  );
}
