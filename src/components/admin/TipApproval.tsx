'use client';

import { useState, useEffect } from 'react';
import type { TipWithAuthor, TipStatus } from '@/types/database';

export default function TipApproval() {
  const [tips, setTips] = useState<TipWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TipStatus | 'all'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchTips();
  }, [filter]);

  const fetchTips = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' 
        ? '/api/admin/tips'
        : `/api/admin/tips?status=${filter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setTips(data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tipId: string, status: 'approved' | 'rejected') => {
    setProcessing(tipId);
    try {
      const response = await fetch(`/api/tips/approve/${tipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        // Remove the tip from the list
        setTips(tips.filter(tip => tip.id !== tipId));
      } else {
        alert(`Failed to ${status} tip: ${data.error}`);
      }
    } catch (error) {
      console.error(`Error ${status}ing tip:`, error);
      alert(`Failed to ${status} tip`);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Tip Approval</h2>
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
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'approved'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'rejected'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        </div>
      ) : tips.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No tips found with status: {filter}
        </div>
      ) : (
        <div className="space-y-4">
          {tips.map((tip) => (
            <div key={tip.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{tip.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        tip.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : tip.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {tip.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{tip.body}</p>
                  
                  {tip.tags && tip.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tip.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {tip.images && tip.images.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {tip.images.map((image, idx) => (
                        <img
                          key={idx}
                          src={image}
                          alt={`Tip image ${idx + 1}`}
                          className="w-24 h-24 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    <p>Author: {tip.author?.full_name || tip.author?.username || 'Anonymous'}</p>
                    <p>Helpful Count: {tip.helpful_count}</p>
                    <p>Created: {new Date(tip.created_at).toLocaleString()}</p>
                  </div>
                </div>

                {tip.status === 'pending' && (
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleApprove(tip.id, 'approved')}
                      disabled={processing === tip.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === tip.id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleApprove(tip.id, 'rejected')}
                      disabled={processing === tip.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === tip.id ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

