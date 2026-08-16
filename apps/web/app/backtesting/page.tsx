import { AppShell } from '../components/AppShell';
import { EmptyState } from '../components/EmptyState';

export default function BacktestingPage() {
  return (
    <AppShell title="Backtesting" description="Historical replay and optimization workspace placeholder for a future milestone.">
      <EmptyState
        title="Backtest dashboard pending"
        description="This page is reserved for strategy overlays, equity curves, and validation results."
      />
    </AppShell>
  );
}
