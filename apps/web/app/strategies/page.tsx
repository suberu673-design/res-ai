import { AppShell } from '../components/AppShell';
import { EmptyState } from '../components/EmptyState';

export default function StrategiesPage() {
  return (
    <AppShell title="Strategies" description="Strategy catalog and configuration shell for future trading systems.">
      <EmptyState
        title="Strategy library pending"
        description="This page will eventually contain active strategies, configuration, and performance notes."
      />
    </AppShell>
  );
}
