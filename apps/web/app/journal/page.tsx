import { AppShell } from '../components/AppShell';
import { EmptyState } from '../components/EmptyState';

export default function JournalPage() {
  return (
    <AppShell title="Journal" description="Narrative notes and trade review entries for future AI decision logging.">
      <EmptyState
        title="Journal entry view is pending"
        description="This zone is reserved for trade reasoning, review summaries, and audit records."
      />
    </AppShell>
  );
}
