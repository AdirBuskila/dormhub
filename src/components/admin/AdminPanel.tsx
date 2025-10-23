'use client';

import { useState, useEffect } from 'react';
import TipApproval from './TipApproval';
import ListingManagement from './ListingManagement';
import BusinessForm from './BusinessForm';
import BusinessOwnerAssignment from './BusinessOwnerAssignment';

type Tab = 'tips' | 'listings' | 'businesses' | 'owners';

interface AdminStats {
  usersCount: number;
  businessesCount: number;
  hotDealsCount: number;
  eventsCount: number;
  pendingTipsCount: number;
  activeListingsCount: number;
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('tips');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'tips', label: 'Approve Tips' },
    { id: 'listings', label: 'Manage Listings' },
    { id: 'businesses', label: 'Add Business' },
    { id: 'owners', label: 'Assign Owners' },
  ];

  // Fetch statistics
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.usersCount || 0,
      icon: '👥',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      title: 'Businesses',
      value: stats?.businessesCount || 0,
      icon: '🏪',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
    {
      title: 'Hot Deals',
      value: stats?.hotDealsCount || 0,
      icon: '🔥',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
    },
    {
      title: 'Events',
      value: stats?.eventsCount || 0,
      icon: '📅',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      title: 'Pending Tips',
      value: stats?.pendingTipsCount || 0,
      icon: '💡',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
    },
    {
      title: 'Active Listings',
      value: stats?.activeListingsCount || 0,
      icon: '📦',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Statistics Dashboard */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-md p-4 text-white">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span>📊</span>
          Dashboard Stats
        </h2>
        
        {loadingStats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 animate-pulse">
                <div className="h-12"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {statCards.map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-3 transform hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{card.icon}</span>
                  <h3 className="text-xs font-medium text-gray-600 truncate">{card.title}</h3>
                </div>
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {card.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Panel Tabs */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm
                  transition-colors duration-150
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'tips' && <TipApproval />}
          {activeTab === 'listings' && <ListingManagement />}
          {activeTab === 'businesses' && <BusinessForm />}
          {activeTab === 'owners' && <BusinessOwnerAssignment />}
        </div>
      </div>
    </div>
  );
}

