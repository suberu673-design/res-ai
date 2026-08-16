'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { navigationItems } from '../../lib/demo-data';
import { StatusIndicator } from './StatusIndicator';

interface AppShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  backendStatus?: 'online' | 'offline' | 'checking';
}

export function AppShell({
  title,
  description,
  children,
  backendStatus = 'checking',
}: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [marketDataStatus, setMarketDataStatus] = useState<
    'checking' | 'connected' | 'mock' | 'disconnected'
  >('checking');

  const drawerItems = navigationItems.map((item) => ({
    ...item,
    active:
      pathname === item.href ||
      (item.href === '/dashboard' && pathname === '/'),
  }));

  useEffect(() => {
    const checkMarketData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/market/status`,
          {
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          setMarketDataStatus('disconnected');
          return;
        }

        const data = await response.json();
        setMarketDataStatus(
          data.mode === 'MOCK'
            ? 'mock'
            : data.connected
              ? 'connected'
              : 'disconnected'
        );
      } catch {
        setMarketDataStatus('disconnected');
      }
    };

    checkMarketData();
    const interval = setInterval(checkMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getBackendTone = () => {
    if (backendStatus === 'online') return 'positive';
    if (backendStatus === 'offline') return 'negative';
    return 'warning';
  };

  const getBackendLabel = () => {
    if (backendStatus === 'online') return 'Connected';
    if (backendStatus === 'offline') return 'Disconnected';
    return 'Checking';
  };

  const getMarketLabel = () => {
    if (marketDataStatus === 'connected') return 'Connected';
    if (marketDataStatus === 'mock') return 'MOCK';
    if (marketDataStatus === 'disconnected') return 'Disconnected';
    return 'Checking';
  };

  const getMarketTone = () => {
    if (marketDataStatus === 'connected') return 'positive';
    if (marketDataStatus === 'mock') return 'warning';
    if (marketDataStatus === 'disconnected') return 'negative';
    return 'neutral';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-800 bg-slate-950/90 lg:flex lg:flex-col">
          <div className="border-b border-slate-800 px-6 py-5">
            <div className="text-xs uppercase tracking-[0.32em] text-sky-400">
              AI FOREX
            </div>
            <div className="mt-2 text-sm text-slate-400">
              Paper trading console
            </div>
          </div>

          <nav
            aria-label="Sidebar navigation"
            className="flex-1 space-y-1 px-3 py-4"
          >
            {drawerItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  item.active
                    ? 'bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-500/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="border-t border-slate-800 px-4 py-4 text-xs text-slate-500">
            Demo environment · M1 Shell
          </div>
        </aside>

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-800 bg-slate-950/95 p-0 transition-transform duration-200 lg:hidden ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
            <div className="text-xs uppercase tracking-[0.32em] text-sky-400">
              AI FOREX
            </div>
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="rounded border border-slate-700 px-2 py-1 text-slate-300"
            >
              ✕
            </button>
          </div>

          <nav aria-label="Mobile navigation" className="space-y-1 px-3 py-4">
            {drawerItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  item.active
                    ? 'bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-500/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-800 bg-slate-950/90 px-4 py-4 backdrop-blur md:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Open navigation"
                  onClick={() => setMobileOpen(true)}
                  className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-300 lg:hidden"
                >
                  ☰
                </button>
                <div>
                  <div className="text-xs uppercase tracking-[0.28em] text-sky-400">
                    AI FOREX
                  </div>
                  <div className="mt-1 text-sm text-slate-400">{title}</div>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                <StatusIndicator
                  label="Mode"
                  value="Autonomous Paper"
                  tone="neutral"
                />
                <StatusIndicator
                  label="Trading Style"
                  value="Intraday"
                  tone="neutral"
                />
                <StatusIndicator
                  label="AI"
                  value="Online"
                  tone="positive"
                  dot
                />
                <StatusIndicator
                  label="Backend"
                  value={getBackendLabel()}
                  tone={getBackendTone()}
                  dot
                />
                <StatusIndicator
                  label="Market Data"
                  value={getMarketLabel()}
                  tone={getMarketTone()}
                  dot
                />
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-100">
                  {title}
                </h1>
                <p className="mt-1 text-sm text-slate-400">{description}</p>
              </div>
              <div className="hidden rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-slate-300 md:block">
                Paper Account
              </div>
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
