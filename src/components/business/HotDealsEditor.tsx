'use client';

import { useState, useEffect } from 'react';
import HotDealImageUploader from './HotDealImageUploader';

interface HotDeal {
  id: string;
  business_id: string;
  title: string;
  description: string;
  image_url: string | null;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
}

interface HotDealsEditorProps {
  businessId: string;
}

export default function HotDealsEditor({ businessId }: HotDealsEditorProps) {
  const [hotDeals, setHotDeals] = useState<HotDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    validFrom: new Date().toISOString().slice(0, 16),
    validUntil: '',
    isActive: true,
  });

  useEffect(() => {
    fetchHotDeals();
  }, [businessId]);

  const fetchHotDeals = async () => {
    try {
      const response = await fetch(`/api/business/hot-deals?businessId=${businessId}`);
      if (!response.ok) throw new Error('Failed to fetch hot deals');
      const data = await response.json();
      setHotDeals(data.hotDeals || []);
    } catch (error) {
      console.error('Error fetching hot deals:', error);
      setMessage({ type: 'error', text: 'Failed to load hot deals' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      validFrom: new Date().toISOString().slice(0, 16),
      validUntil: '',
      isActive: true,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleAdd = async () => {
    if (!formData.title || !formData.description) {
      setMessage({ type: 'error', text: 'Title and description are required' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/business/hot-deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          title: formData.title,
          description: formData.description,
          imageUrl: formData.imageUrl || null,
          validFrom: formData.validFrom,
          validUntil: formData.validUntil || null,
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) throw new Error('Failed to create hot deal');

      await fetchHotDeals();
      resetForm();
      setMessage({ type: 'success', text: 'Hot deal created successfully!' });
    } catch (error) {
      console.error('Error creating hot deal:', error);
      setMessage({ type: 'error', text: 'Failed to create hot deal. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (deal: HotDeal) => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/business/hot-deals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          hotDealId: deal.id,
          title: deal.title,
          description: deal.description,
          imageUrl: deal.image_url,
          validFrom: deal.valid_from,
          validUntil: deal.valid_until,
          isActive: deal.is_active,
        }),
      });

      if (!response.ok) throw new Error('Failed to update hot deal');

      await fetchHotDeals();
      setEditingId(null);
      setMessage({ type: 'success', text: 'Hot deal updated successfully!' });
    } catch (error) {
      console.error('Error updating hot deal:', error);
      setMessage({ type: 'error', text: 'Failed to update hot deal. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dealId: string) => {
    if (!confirm('Are you sure you want to delete this hot deal?')) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/business/hot-deals', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, hotDealId: dealId }),
      });

      if (!response.ok) throw new Error('Failed to delete hot deal');

      await fetchHotDeals();
      setMessage({ type: 'success', text: 'Hot deal deleted successfully!' });
    } catch (error) {
      console.error('Error deleting hot deal:', error);
      setMessage({ type: 'error', text: 'Failed to delete hot deal. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (deal: HotDeal) => {
    const updated = { ...deal, is_active: !deal.is_active };
    await handleUpdate(updated);
  };

  const startEdit = (deal: HotDeal) => {
    setEditingId(deal.id);
    setShowAddForm(false);
  };

  const updateDeal = (id: string, field: keyof HotDeal, value: any) => {
    setHotDeals(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'No expiration';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Add New Deal Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Hot Deal
        </button>
      )}

      {/* Add New Deal Form */}
      {showAddForm && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-lg p-6 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              Create Hot Deal
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deal Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Buy 1 Get 1 Free on All Drinks!"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your amazing deal..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <HotDealImageUploader
              businessId={businessId}
              onImageUploaded={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
              currentImageUrl={formData.imageUrl}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                <input
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Active (visible to students)</span>
            </label>

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={saving}
                className="flex-1 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 transition-all font-semibold"
              >
                {saving ? 'Creating...' : 'Create Hot Deal'}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Hot Deals */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          Your Hot Deals
        </h2>
        {hotDeals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-gray-500 mb-2">No hot deals yet!</p>
            <p className="text-sm text-gray-400">Create your first deal to attract more customers</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hotDeals.map(deal => (
              <div key={deal.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                {editingId === deal.id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={deal.title}
                      onChange={(e) => updateDeal(deal.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <textarea
                      value={deal.description}
                      onChange={(e) => updateDeal(deal.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                    />
                    <HotDealImageUploader
                      businessId={businessId}
                      onImageUploaded={(url) => updateDeal(deal.id, 'image_url', url)}
                      currentImageUrl={deal.image_url}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(deal)}
                        disabled={saving}
                        className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-4">
                      {deal.image_url && (
                        <img
                          src={deal.image_url}
                          alt={deal.title}
                          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-900 text-lg">{deal.title}</h3>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            deal.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {deal.is_active ? '✓ Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">{deal.description}</p>
                        <div className="text-xs text-gray-500">
                          <div>Valid from: {formatDate(deal.valid_from)}</div>
                          <div>Valid until: {formatDate(deal.valid_until)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2 flex-wrap">
                      <button
                        onClick={() => startEdit(deal)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => toggleActive(deal)}
                        disabled={saving}
                        className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                      >
                        {deal.is_active ? '⏸️ Deactivate' : '▶️ Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(deal.id)}
                        disabled={saving}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

