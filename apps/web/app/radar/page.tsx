import { AppShell } from '../components/AppShell';
import { MarketIntelligencePanel } from '../components/MarketIntelligencePanel';
import { OpportunityTable } from '../components/OpportunityTable';

export default function RadarPage() {
  return (
    <AppShell title="Market Radar" description="Deterministic forex market intelligence derived from normalized candles.">
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-100">Opportunity Radar</h2>
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Demo data</span>
          </div>
          <OpportunityTable />
        </div>

        <MarketIntelligencePanel pair="EURUSD" />
      </div>
    </AppShell>
  );
}
