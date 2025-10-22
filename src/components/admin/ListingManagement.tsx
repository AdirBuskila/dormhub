'use client';

import { useState, useEffect } from 'react';
import type { ListingWithOwner, ListingStatus } from '@/types/database';

export default function ListingManagement() {
  const [listings, setListings] = useState<ListingWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ListingStatus | 'all'>('active');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, [filter]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' 
        ? '/api/admin/listings'
        : `/api/admin/listings?status=${filter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setListings(data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (listingId: string, status: ListingStatus) => {
    setProcessing(listingId);
    try {
      const response = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, status }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the listing in the list
        setListings(listings.map(listing => 
          listing.id === listingId ? { ...listing, status } : listing
        ));
      } else {
        alert(`Failed to update listing: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      alert('Failed to update listing');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Listing Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('reserved')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'reserved'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Reserved
          </button>
          <button
            onClick={() => setFilter('sold')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'sold'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Sold
          </button>
          <button
            onClick={() => setFilter('removed')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'removed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Removed
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No listings found with status: {filter}
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{listing.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        listing.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : listing.status === 'reserved'
                          ? 'bg-yellow-100 text-yellow-800'
                          : listing.status === 'sold'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {listing.status}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                      {listing.type}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-2">{listing.description}</p>
                  
                  {listing.price_ils && (
                    <p className="text-lg font-bold text-green-600 mb-2">
                      ₪{listing.price_ils}
                    </p>
                  )}

                  {listing.images && listing.images.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {listing.images.slice(0, 3).map((image, idx) => (
                        <img
                          key={idx}
                          src={image}
                          alt={`Listing image ${idx + 1}`}
                          className="w-24 h-24 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    <p>Owner: {listing.owner?.full_name || listing.owner?.username || 'Unknown'}</p>
                    <p>Category: {listing.category || 'N/A'}</p>
                    <p>Condition: {listing.condition || 'N/A'}</p>
                    <p>Views: {listing.view_count}</p>
                    <p>Created: {new Date(listing.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <select
                    value={listing.status}
                    onChange={(e) => handleUpdateStatus(listing.id, e.target.value as ListingStatus)}
                    disabled={processing === listing.id}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    <option value="active">Active</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                    <option value="removed">Removed</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

