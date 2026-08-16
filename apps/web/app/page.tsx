'use client';

import { useEffect, useState } from 'react';
import Navigation from './components/Navigation';
import StatusBar from './components/StatusBar';
import MainDashboard from './components/MainDashboard';

export default function Home() {
  const [apiHealth, setApiHealth] = useState<string>('checking');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/health`
        );
        if (response.ok) {
          setApiHealth('online');
        } else {
          setApiHealth('offline');
        }
      } catch (error) {
        setApiHealth('offline');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-gray-950 text-gray-50">
      {/* Sidebar Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Status Bar */}
        <StatusBar apiHealth={apiHealth} />

        {/* Main Dashboard Content */}
        <MainDashboard />
      </div>
    </div>
  );
}
