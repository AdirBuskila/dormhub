'use client';

import { useState } from 'react';
import BusinessHoursEditor from './BusinessHoursEditor';
import DiscountsEditor from './DiscountsEditor';
import BusinessInfoEditor from './BusinessInfoEditor';
import HotDealsEditor from './HotDealsEditor';

interface BusinessHour {
  id: string;
  day_of_week: string;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
  notes: string | null;
}

interface StudentDiscount {
  id: string;
  title: string;
  description: string | null;
  discount_type: string | null;
  discount_value: string | null;
  terms: string | null;
  valid_days: string[] | null;
  valid_from: string | null;
  valid_until: string | null;
  requires_student_id: boolean;
  is_active: boolean;
}

interface Business {
  id: string;
  name: string;
  category: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  whatsapp: string | null;
  logo_url: string | null;
  is_active: boolean;
  business_hours: BusinessHour[];
  student_discounts: StudentDiscount[];
}

interface UserData {
  firstName: string;
  lastName: string;
}

interface BusinessDashboardProps {
  business: Business;
  userData: UserData;
}

export default function BusinessDashboard({ business, userData }: BusinessDashboardProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'hours' | 'discounts' | 'hotdeals'>('info');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1);
    // Force page refresh to get updated data
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Business Dashboard - Manage your store information
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p className="font-medium text-gray-900">{userData.firstName} {userData.lastName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Business Info
            </button>
            <button
              onClick={() => setActiveTab('hours')}
              className={`${
                activeTab === 'hours'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Opening Hours
            </button>
            <button
              onClick={() => setActiveTab('discounts')}
              className={`${
                activeTab === 'discounts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Student Discounts
            </button>
            <button
              onClick={() => setActiveTab('hotdeals')}
              className={`${
                activeTab === 'hotdeals'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-1`}
            >
              <span className="text-lg">🔥</span>
              Hot Deals
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6 pb-12">
          {activeTab === 'info' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Business Information</h2>
              <BusinessInfoEditor business={business} onUpdate={handleUpdate} />
            </div>
          )}

          {activeTab === 'hours' && (
            <BusinessHoursEditor 
              businessId={business.id}
              initialHours={business.business_hours}
            />
          )}

          {activeTab === 'discounts' && (
            <DiscountsEditor
              businessId={business.id}
              initialDiscounts={business.student_discounts}
            />
          )}

          {activeTab === 'hotdeals' && (
            <HotDealsEditor businessId={business.id} />
          )}
        </div>
      </div>
    </div>
  );
}

