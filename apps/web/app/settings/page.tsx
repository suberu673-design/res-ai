import { AppShell } from '../components/AppShell';
import { EmptyState } from '../components/EmptyState';

export default function SettingsPage() {
  return (
    <AppShell title="Settings" description="Platform preferences and operational controls placeholder for later milestones.">
      <EmptyState
        title="Settings are not yet implemented"
        description="This area will soon contain operating mode, risk, and system configuration controls."
      />
    </AppShell>
  );
}
