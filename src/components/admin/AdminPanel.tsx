'use client';

import { useState } from 'react';
import TipApproval from './TipApproval';
import ListingManagement from './ListingManagement';
import BusinessForm from './BusinessForm';
import BusinessOwnerAssignment from './BusinessOwnerAssignment';

type Tab = 'tips' | 'listings' | 'businesses' | 'owners';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('tips');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'tips', label: 'Approve Tips' },
    { id: 'listings', label: 'Manage Listings' },
    { id: 'businesses', label: 'Add Business' },
    { id: 'owners', label: 'Assign Owners' },
  ];

  return (
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
  );
}

