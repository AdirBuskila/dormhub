'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function AlertsBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (!isSignedIn) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/alerts/count');
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.unread || 0);
        }
      } catch (error) {
        console.error('Error fetching unread alerts count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isSignedIn]);

  if (!isSignedIn || loading) {
    return null;
  }

  return (
    <Link
      href="/alerts"
      className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      title="View alerts"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}

