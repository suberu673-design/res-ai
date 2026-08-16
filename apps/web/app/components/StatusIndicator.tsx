type StatusTone = 'positive' | 'negative' | 'neutral' | 'warning';

interface StatusIndicatorProps {
  label: string;
  value: string;
  tone?: StatusTone;
  dot?: boolean;
}

const toneStyles: Record<StatusTone, string> = {
  positive: 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/30',
  negative: 'text-rose-300 bg-rose-500/10 border border-rose-500/30',
  neutral: 'text-slate-200 bg-slate-500/10 border border-slate-500/30',
  warning: 'text-amber-300 bg-amber-500/10 border border-amber-500/30',
};

export function StatusIndicator({ label, value, tone = 'neutral', dot = false }: StatusIndicatorProps) {
  return (
    <div className={`rounded-md px-3 py-2 ${toneStyles[tone]}`}>
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-100">
        {dot ? <span className="h-2 w-2 rounded-full bg-current" aria-label={`${label} status indicator`} /> : null}
        <span>{value}</span>
      </div>
    </div>
  );
}
