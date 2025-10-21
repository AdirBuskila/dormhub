'use client';

import { useState } from 'react';

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

interface DiscountsEditorProps {
  businessId: string;
  initialDiscounts: StudentDiscount[];
}

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function DiscountsEditor({ businessId, initialDiscounts }: DiscountsEditorProps) {
  const [discounts, setDiscounts] = useState<StudentDiscount[]>(initialDiscounts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [newDiscount, setNewDiscount] = useState<Partial<StudentDiscount>>({
    title: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    terms: '',
    valid_days: null,
    valid_from: null,
    valid_until: null,
    requires_student_id: true,
    is_active: true,
  });

  const handleAdd = async () => {
    if (!newDiscount.title || !newDiscount.discount_value) {
      setMessage({ type: 'error', text: 'Title and discount value are required' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/business/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, ...newDiscount }),
      });

      if (!response.ok) throw new Error('Failed to add discount');

      const added = await response.json();
      setDiscounts(prev => [...prev, added.discount]);
      setNewDiscount({
        title: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        terms: '',
        valid_days: null,
        valid_from: null,
        valid_until: null,
        requires_student_id: true,
        is_active: true,
      });
      setMessage({ type: 'success', text: 'Discount added successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add discount. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (discount: StudentDiscount) => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/business/discounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, discount }),
      });

      if (!response.ok) throw new Error('Failed to update discount');

      setMessage({ type: 'success', text: 'Discount updated successfully!' });
      setEditingId(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update discount. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (discountId: string) => {
    if (!confirm('Are you sure you want to delete this discount?')) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/business/discounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, discountId }),
      });

      if (!response.ok) throw new Error('Failed to delete discount');

      setDiscounts(prev => prev.filter(d => d.id !== discountId));
      setMessage({ type: 'success', text: 'Discount deleted successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete discount. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const updateDiscount = (id: string, field: keyof StudentDiscount, value: any) => {
    setDiscounts(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Add New Discount */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Discount</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Title *</label>
            <input
              type="text"
              value={newDiscount.title}
              onChange={(e) => setNewDiscount(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., 10% Student Discount"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newDiscount.description || ''}
              onChange={(e) => setNewDiscount(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your discount..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
              <select
                value={newDiscount.discount_type || 'percentage'}
                onChange={(e) => setNewDiscount(prev => ({ ...prev, discount_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed_amount">Fixed Amount</option>
                <option value="buy_one_get_one">Buy One Get One</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value *</label>
              <input
                type="text"
                value={newDiscount.discount_value}
                onChange={(e) => setNewDiscount(prev => ({ ...prev, discount_value: e.target.value }))}
                placeholder="e.g., 10%, 5 ILS, BOGO"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
            <textarea
              value={newDiscount.terms || ''}
              onChange={(e) => setNewDiscount(prev => ({ ...prev, terms: e.target.value }))}
              placeholder="Any special conditions..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newDiscount.requires_student_id}
                onChange={(e) => setNewDiscount(prev => ({ ...prev, requires_student_id: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Requires Student ID</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newDiscount.is_active}
                onChange={(e) => setNewDiscount(prev => ({ ...prev, is_active: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>

          <button
            onClick={handleAdd}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Adding...' : 'Add Discount'}
          </button>
        </div>
      </div>

      {/* Existing Discounts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Discounts</h2>
        {discounts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No discounts yet. Add your first discount above!</p>
        ) : (
          <div className="space-y-4">
            {discounts.map(discount => (
              <div key={discount.id} className="border border-gray-200 rounded-lg p-4">
                {editingId === discount.id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={discount.title}
                      onChange={(e) => updateDiscount(discount.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <textarea
                      value={discount.description || ''}
                      onChange={(e) => updateDiscount(discount.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(discount)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Save
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
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{discount.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{discount.description}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        discount.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {discount.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">{discount.discount_value}</span>
                      {discount.requires_student_id && ' • Student ID Required'}
                    </div>
                    {discount.terms && (
                      <p className="text-sm text-gray-500 mt-2">Terms: {discount.terms}</p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => setEditingId(discount.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => updateDiscount(discount.id, 'is_active', !discount.is_active)}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        {discount.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(discount.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
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

