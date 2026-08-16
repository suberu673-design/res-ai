'use client';

import React from 'react';

interface DashboardCard {
  title: string;
  description: string;
  status: string;
}

export default function MainDashboard() {
  const cards: DashboardCard[] = [
    {
      title: 'Market Radar',
      description: 'Real-time forex market scanning and opportunity discovery',
      status: 'Coming Soon',
    },
    {
      title: 'Positions',
      description: 'Active open positions and risk management',
      status: 'Coming Soon',
    },
    {
      title: 'Trades',
      description: 'Trade history and performance analytics',
      status: 'Coming Soon',
    },
    {
      title: 'Journal',
      description: 'Trading journal and decision logs',
      status: 'Coming Soon',
    },
    {
      title: 'Strategies',
      description: 'Strategy management and configuration',
      status: 'Coming Soon',
    },
    {
      title: 'Backtesting',
      description: 'Historical strategy backtesting and analysis',
      status: 'Coming Soon',
    },
    {
      title: 'Analytics',
      description: 'Advanced trading analytics and reports',
      status: 'Coming Soon',
    },
    {
      title: 'Settings',
      description: 'Platform configuration and preferences',
      status: 'Coming Soon',
    },
  ];

  return (
    <main className="flex-1 overflow-auto p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">Welcome</h3>
        <p className="text-gray-400">
          AI Forex Trading Platform - Foundation Release (D0)
        </p>
        <p className="text-sm text-gray-500 mt-2">
          This is the project foundation. Core features are being developed.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Account Balance</div>
          <div className="text-2xl font-bold text-green-400 mt-2">$100,000</div>
          <div className="text-xs text-gray-500 mt-1">Demo Account</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Open Positions</div>
          <div className="text-2xl font-bold text-blue-400 mt-2">0</div>
          <div className="text-xs text-gray-500 mt-1">No active trades</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Total P&L</div>
          <div className="text-2xl font-bold text-gray-300 mt-2">$0.00</div>
          <div className="text-xs text-gray-500 mt-1">0.00%</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Active Strategies</div>
          <div className="text-2xl font-bold text-yellow-400 mt-2">0</div>
          <div className="text-xs text-gray-500 mt-1">None deployed</div>
        </div>
      </div>

      {/* Feature Cards */}
      <h3 className="text-xl font-bold text-white mb-4">Platform Modules</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
          >
            <h4 className="text-lg font-semibold text-white mb-2">
              {card.title}
            </h4>
            <p className="text-sm text-gray-400 mb-4">{card.description}</p>
            <div className="inline-block px-3 py-1 bg-gray-700 rounded text-xs text-gray-300">
              {card.status}
            </div>
          </div>
        ))}
      </div>

      {/* Documentation Section */}
      <div className="mt-8 bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-300 mb-2">
          Getting Started
        </h4>
        <p className="text-sm text-gray-300 mb-4">
          This is the D0 foundation release of the AI Forex Trading Platform.
          The backend API is running and the database is ready. You can start
          building trading modules in M1.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">API Status:</p>
            <p className="text-sm font-mono text-green-400">✓ Running</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Database:</p>
            <p className="text-sm font-mono text-green-400">✓ Connected</p>
          </div>
        </div>
      </div>
    </main>
  );
}
