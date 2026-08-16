import { ActivityFeed } from '../components/ActivityFeed';
import { AppShell } from '../components/AppShell';

export default function ActivityPage() {
  return (
    <AppShell title="AI Activity" description="A timeline of scanner and analysis events for future backend streaming integration.">
      <div className="max-w-3xl">
        <ActivityFeed />
      </div>
    </AppShell>
  );
}
