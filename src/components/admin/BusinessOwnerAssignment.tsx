'use client';

import { useState, useEffect } from 'react';

interface Business {
  id: string;
  name: string;
  category: string;
  owner_clerk_id: string | null;
  is_active: boolean;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
}

export default function BusinessOwnerAssignment() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [businessesRes, usersRes] = await Promise.all([
        fetch('/api/admin/businesses'),
        fetch('/api/admin/users'),
      ]);

      const businessesData = await businessesRes.json();
      const usersData = await usersRes.json();

      if (businessesData.success) {
        setBusinesses(businessesData.data || []);
      }

      if (usersData.success) {
        setUsers(usersData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignOwner = async (businessId: string, ownerClerkId: string | null) => {
    setProcessing(businessId);
    try {
      const response = await fetch('/api/admin/businesses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, ownerClerkId }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the business in the list
        setBusinesses(businesses.map(business => 
          business.id === businessId 
            ? { ...business, owner_clerk_id: ownerClerkId } 
            : business
        ));
        alert(data.message);
      } else {
        alert(`Failed to assign owner: ${data.error}`);
      }
    } catch (error) {
      console.error('Error assigning owner:', error);
      alert('Failed to assign owner');
    } finally {
      setProcessing(null);
    }
  };

  const getOwnerName = (ownerClerkId: string | null) => {
    if (!ownerClerkId) return 'No owner';
    const user = users.find(u => u.id === ownerClerkId);
    return user ? user.fullName || user.email : 'Unknown';
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Assign Business Owners</h2>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        </div>
      ) : businesses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No businesses found
        </div>
      ) : (
        <div className="space-y-4">
          {businesses.map((business) => (
            <div key={business.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{business.name}</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                      {business.category}
                    </span>
                    {!business.is_active && (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Current Owner: <span className="font-medium">{getOwnerName(business.owner_clerk_id)}</span>
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label htmlFor={`owner-${business.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Select Owner
                      </label>
                      <select
                        id={`owner-${business.id}`}
                        value={business.owner_clerk_id || ''}
                        onChange={(e) => {
                          const value = e.target.value || null;
                          if (confirm(`Are you sure you want to ${value ? 'assign' : 'remove'} owner for ${business.name}?`)) {
                            handleAssignOwner(business.id, value);
                          }
                        }}
                        disabled={processing === business.id}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                      >
                        <option value="">No owner</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.fullName} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    {business.owner_clerk_id && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove owner from ${business.name}?`)) {
                            handleAssignOwner(business.id, null);
                          }
                        }}
                        disabled={processing === business.id}
                        className="mt-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Remove Owner
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

