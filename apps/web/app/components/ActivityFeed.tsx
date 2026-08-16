import { activityFeed } from '../../lib/demo-data';

export function ActivityFeed() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">AI Activity Feed</h3>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-300">
          Live demo
        </span>
      </div>

      <div className="relative pl-6">
        <div className="absolute inset-y-0 left-3 w-px bg-slate-700" aria-hidden="true" />
        <ul className="space-y-5">
          {activityFeed.map((event) => (
            <li key={`${event.time}-${event.title}`} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full border border-sky-500 bg-sky-500/30" aria-hidden="true" />
              <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{event.time}</div>
                <div className="mt-1 text-sm font-medium text-slate-100">{event.title}</div>
                <div className="mt-1 text-xs text-slate-400">{event.detail}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
