import { AppShell } from '../components/AppShell';
import { MarketIntelligencePanel } from '../components/MarketIntelligencePanel';
import { OpportunityRadar } from '../components/OpportunityRadar';

export default function RadarPage() {
  return (
    <AppShell
      title="Market Radar"
      description="Opportunity discovery built on top of deterministic market intelligence."
    >
      <div className="space-y-6">
        <OpportunityRadar />
        <MarketIntelligencePanel pair="EURUSD" />
      </div>
    </AppShell>
  );
}
