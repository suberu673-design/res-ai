import { AppShell } from '../components/AppShell';
import { EmptyState } from '../components/EmptyState';

export default function AnalyticsPage() {
  return (
    <AppShell title="Analytics" description="Performance and execution analytics placeholders for future reporting.">
      <EmptyState
        title="Analytics workspace pending"
        description="Future metrics, charts, and review panels will live here once the data model is connected."
      />
    </AppShell>
  );
}
