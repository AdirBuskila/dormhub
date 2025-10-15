'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function AlertsBell() {
  const [alertCount, setAlertCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const t = useTranslations();

  useEffect(() => {
    async function fetchAlertCount() {
      try {
        const response = await fetch('/api/alerts/count');
        const data = await response.json();
        setAlertCount(data.count || 0);
      } catch (error) {
        console.error('Failed to fetch alert count:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAlertCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAlertCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="relative">
        <Bell className="h-6 w-6 text-gray-400" />
      </div>
    );
  }

  return (
    <Link href="/alerts" className="relative">
      <Bell className="h-6 w-6 text-gray-600 hover:text-gray-900 transition-colors" />
      {alertCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {alertCount > 99 ? '99+' : alertCount}
        </span>
      )}
    </Link>
  );
}