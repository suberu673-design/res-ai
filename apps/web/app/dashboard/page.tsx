'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { ActivityFeed } from '../components/ActivityFeed';
import { AnalysisPanel } from '../components/AnalysisPanel';
import { MarketIntelligencePanel } from '../components/MarketIntelligencePanel';
import { MetricCard } from '../components/MetricCard';
import { OpportunityTable } from '../components/OpportunityTable';
import { PositionTable } from '../components/PositionTable';
import { dashboardMetrics, opportunityRows } from '../../lib/demo-data';

export default function DashboardPage() {
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [selectedPair, setSelectedPair] = useState<string | null>('EUR/USD');

  const selectedOpportunity = useMemo(
    () => opportunityRows.find((row) => row.pair === selectedPair) ?? opportunityRows[0],
    [selectedPair]
  );

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/health`, {
          cache: 'no-store',
        });
        setBackendStatus(response.ok ? 'online' : 'offline');
      } catch {
        setBackendStatus('offline');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppShell title="Dashboard" description="AI-powered forex monitoring overview with demo data only." backendStatus={backendStatus}>
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dashboardMetrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              note={metric.note}
              tone={metric.tone}
            />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-100">Opportunity Radar</h2>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Demo data</span>
            </div>
            <OpportunityTable onViewAnalysis={setSelectedPair} />
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 md:p-5">
            <h2 className="text-xl font-semibold text-slate-100">AI Activity Feed</h2>
            <div className="mt-4">
              <ActivityFeed />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-100">Active Positions</h2>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Paper only</span>
            </div>
            <PositionTable />
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 md:p-5">
            <h2 className="text-xl font-semibold text-slate-100">Analysis Panel</h2>
            <div className="mt-4">
              <AnalysisPanel
                pair={selectedOpportunity.pair}
                direction={selectedOpportunity.direction}
                confidence={selectedOpportunity.confidence}
                strategy={selectedOpportunity.strategy}
                tradingStyle={selectedOpportunity.tradingStyle}
                entryZone={selectedOpportunity.entryZone}
                stop={selectedOpportunity.stop}
                target={selectedOpportunity.target}
                riskReward={selectedOpportunity.riskReward}
                why={selectedOpportunity.why}
                risks={selectedOpportunity.risks}
                invalidation={selectedOpportunity.invalidation}
              />
            </div>
          </div>
        </section>

        <MarketIntelligencePanel pair={selectedOpportunity.pair.replace('/', '').replace(' ', '')} />
      </div>
    </AppShell>
  );
}
