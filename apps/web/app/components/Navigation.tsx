'use client';

import React from 'react';
import Link from 'next/link';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export default function Navigation() {
  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '#', icon: '📊' },
    { label: 'Market Radar', href: '#', icon: '📡' },
    { label: 'Positions', href: '#', icon: '💰' },
    { label: 'Trades', href: '#', icon: '📈' },
    { label: 'Journal', href: '#', icon: '📓' },
    { label: 'Strategies', href: '#', icon: '🎯' },
    { label: 'Backtesting', href: '#', icon: '⏮️' },
    { label: 'Analytics', href: '#', icon: '📉' },
    { label: 'Settings', href: '#', icon: '⚙️' },
  ];

  return (
    <nav className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">Forex AI</h1>
        <p className="text-xs text-gray-400 mt-1">Trading Platform D0</p>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-blue-400 transition-colors border-l-2 border-transparent hover:border-blue-400"
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
        <p>© 2024 AI Forex Platform</p>
      </div>
    </nav>
  );
}
