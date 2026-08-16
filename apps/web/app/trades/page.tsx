import { AppShell } from '../components/AppShell';
import { EmptyState } from '../components/EmptyState';

export default function TradesPage() {
  return (
    <AppShell title="Trades" description="Trade history and execution journal placeholders for future API integration.">
      <EmptyState
        title="Trade history is not yet connected"
        description="This space will eventually list executed paper and live trades, their tags, and audit details."
      />
    </AppShell>
  );
}
