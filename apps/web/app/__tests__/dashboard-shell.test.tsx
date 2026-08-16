import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppShell } from '../components/AppShell';
import DashboardPage from '../dashboard/page';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('M1 dashboard shell', () => {
  it('renders the main dashboard page', () => {
    render(<DashboardPage />);

    expect(screen.getAllByText('AI FOREX').length).toBeGreaterThan(0);
    expect(screen.getByText('Account Balance')).toBeInTheDocument();
  });

  it('renders navigation items', () => {
    render(
      <AppShell title="Dashboard" description="Demo dashboard shell">
        <div>Test content</div>
      </AppShell>
    );

    expect(screen.getAllByRole('navigation').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Market Radar').length).toBeGreaterThan(0);
    expect(screen.getAllByText('AI Activity').length).toBeGreaterThan(0);
  });

  it('renders key dashboard components', () => {
    render(<DashboardPage />);

    expect(screen.getAllByText('Opportunity Radar').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Active Positions').length).toBeGreaterThan(0);
    expect(screen.getAllByText('AI Activity Feed').length).toBeGreaterThan(0);
  });
});
