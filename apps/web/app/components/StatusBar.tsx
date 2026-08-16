'use client';

interface StatusBarProps {
  apiHealth: string;
}

export default function StatusBar({ apiHealth }: StatusBarProps) {
  const getStatusColor = () => {
    switch (apiHealth) {
      case 'online':
        return 'bg-green-900 text-green-300';
      case 'checking':
        return 'bg-yellow-900 text-yellow-300';
      default:
        return 'bg-red-900 text-red-300';
    }
  };

  const getStatusDot = () => {
    switch (apiHealth) {
      case 'online':
        return '🟢';
      case 'checking':
        return '🟡';
      default:
        return '🔴';
    }
  };

  return (
    <header className="bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-white">
          AI Forex Trading Platform
        </h2>
        <p className="text-xs text-gray-400 mt-1">Foundation Release D0</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Account Info Placeholder */}
        <div className="text-right">
          <div className="text-sm text-gray-300">Demo Account</div>
          <div className="text-xs text-gray-500">$100,000.00</div>
        </div>

        {/* API Status */}
        <div
          className={`px-3 py-2 rounded text-xs font-mono flex items-center gap-2 ${getStatusColor()}`}
        >
          <span>{getStatusDot()}</span>
          <span>API {apiHealth}</span>
        </div>

        {/* User Profile Placeholder */}
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
          D
        </div>
      </div>
    </header>
  );
}
