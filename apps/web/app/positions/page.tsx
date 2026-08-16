import { AppShell } from '../components/AppShell';
import { PositionTable } from '../components/PositionTable';

export default function PositionsPage() {
  return (
    <AppShell title="Positions" description="Paper positions and risk view placeholders ready for real backend data.">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-100">Active Positions</h2>
          <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Demo data</span>
        </div>
        <PositionTable />
      </div>
    </AppShell>
  );
}
