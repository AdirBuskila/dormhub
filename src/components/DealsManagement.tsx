'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Edit, Trash2, Flame, Clock, Package, TrendingUp, AlertCircle, X } from 'lucide-react';
import { Deal, CreateDealData, Product, DealPaymentMethod, ExpirationType } from '@/types/database';
import Layout from './Layout';

export default function DealsManagement() {
  const t = useTranslations();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateDealData>({
    title: '',
    description: '',
    product_id: '',
    priority: 5,
    tier_1_qty: 1,
    tier_1_price: 0,
    expiration_type: 'none',
    payment_methods: ['cash'],
  });

  useEffect(() => {
    fetchDeals();
    fetchProducts();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/deals');
      const data = await response.json();
      setDeals(data.deals || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      // Handle both {products: [...]} and [...] response formats
      setProducts(data.products || data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = editingDeal
        ? await fetch(`/api/deals/${editingDeal.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          })
        : await fetch('/api/deals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save deal');
      }
      
      await fetchDeals();
      closeModal();
      
      // Show success notification
      alert(editingDeal ? 'Deal updated successfully!' : 'Deal created successfully!');
    } catch (error) {
      console.error('Error saving deal:', error);
      alert(`Failed to save deal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDelete'))) return;
    
    try {
      await fetch(`/api/deals/${id}`, { method: 'DELETE' });
      fetchDeals();
    } catch (error) {
      console.error('Error deleting deal:', error);
    }
  };

  const toggleActive = async (deal: Deal) => {
    try {
      await fetch(`/api/deals/${deal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !deal.is_active }),
      });
      fetchDeals();
    } catch (error) {
      console.error('Error toggling deal:', error);
    }
  };

  const openEditModal = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title,
      description: deal.description || '',
      product_id: deal.product_id,
      priority: deal.priority,
      tier_1_qty: deal.tier_1_qty,
      tier_1_price: deal.tier_1_price,
      tier_2_qty: deal.tier_2_qty || undefined,
      tier_2_price: deal.tier_2_price || undefined,
      tier_3_qty: deal.tier_3_qty || undefined,
      tier_3_price: deal.tier_3_price || undefined,
      expiration_type: deal.expiration_type,
      expires_at: deal.expires_at || undefined,
      max_quantity: deal.max_quantity || undefined,
      payment_methods: deal.payment_methods,
      payment_surcharge_check_month: deal.payment_surcharge_check_month,
      payment_surcharge_check_week: deal.payment_surcharge_check_week,
      payment_notes: deal.payment_notes || undefined,
      allowed_colors: deal.allowed_colors || undefined,
      required_importer: deal.required_importer || undefined,
      is_esim: deal.is_esim || undefined,
      notes: deal.notes || undefined,
      internal_notes: deal.internal_notes || undefined,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDeal(null);
    setFormData({
      title: '',
      description: '',
      product_id: '',
      priority: 5,
      tier_1_qty: 1,
      tier_1_price: 0,
      expiration_type: 'none',
      payment_methods: ['cash'],
    });
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 15) return { 
      color: 'bg-red-100 text-red-800', 
      icon: <Flame className="h-3 w-3" />, 
      label: 'Hot',
      borderColor: 'border-red-300',
      bgGradient: 'bg-gradient-to-r from-red-50 to-orange-50'
    };
    if (priority >= 10) return { 
      color: 'bg-cyan-100 text-cyan-800', 
      icon: <TrendingUp className="h-3 w-3" />, 
      label: 'High',
      borderColor: 'border-cyan-300',
      bgGradient: 'bg-gradient-to-r from-cyan-50 to-purple-50'
    };
    if (priority >= 5) return { 
      color: 'bg-emerald-100 text-emerald-800', 
      icon: <Package className="h-3 w-3" />, 
      label: 'Medium',
      borderColor: 'border-emerald-300',
      bgGradient: 'bg-gradient-to-r from-emerald-50 to-teal-50'
    };
    return { 
      color: 'bg-gray-100 text-gray-800', 
      icon: <Package className="h-3 w-3" />, 
      label: 'Normal',
      borderColor: 'border-gray-300',
      bgGradient: 'bg-white'
    };
  };

  const getExpirationStatus = (deal: Deal) => {
    if (deal.expiration_type === 'none') return null;
    
    if (deal.expires_at && (deal.expiration_type === 'date' || deal.expiration_type === 'both')) {
      const expiresAt = new Date(deal.expires_at);
      const now = new Date();
      if (now > expiresAt) return { color: 'text-red-600', text: 'Expired' };
      
      const hoursLeft = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60));
      if (hoursLeft < 24) return { color: 'text-orange-600', text: `${hoursLeft}h left` };
      const daysLeft = Math.floor(hoursLeft / 24);
      return { color: 'text-blue-600', text: `${daysLeft}d left` };
    }
    
    if (deal.max_quantity && (deal.expiration_type === 'quantity' || deal.expiration_type === 'both')) {
      const remaining = deal.max_quantity - deal.sold_quantity;
      if (remaining === 0) return { color: 'text-red-600', text: 'Sold Out' };
      if (remaining <= 2) return { color: 'text-orange-600', text: `${remaining} left` };
      return { color: 'text-blue-600', text: `${remaining} left` };
    }
    
    return null;
  };

  if (loading) {
    return (
      <Layout isAdmin={true}>
        <div className="p-8">Loading deals...</div>
      </Layout>
    );
  }

  return (
    <Layout isAdmin={true}>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Flame className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
            {t('deals.title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">{t('deals.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base whitespace-nowrap"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          {t('deals.createNew')}
        </button>
      </div>

      {/* Deals List */}
      <div className="grid gap-4 px-1">
        {deals.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Flame className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('deals.empty')}</p>
          </div>
        ) : (
          deals.map((deal) => {
            const priorityBadge = getPriorityBadge(deal.priority);
            const expStatus = getExpirationStatus(deal);
            
            return (
              <div
                key={deal.id}
                className={`rounded-lg shadow-sm border-2 p-3 sm:p-4 transition-all ${
                  deal.is_active 
                    ? `${priorityBadge.borderColor} ${priorityBadge.bgGradient}` 
                    : 'border-gray-200 bg-white opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* Title and Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{deal.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${priorityBadge.color}`}>
                        {priorityBadge.icon}
                        {priorityBadge.label}
                      </span>
                      {!deal.is_active && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {t('deals.inactive')}
                        </span>
                      )}
                      {expStatus && (
                        <span className={`text-xs font-medium flex items-center gap-1 ${expStatus.color}`}>
                          <Clock className="h-3 w-3" />
                          {expStatus.text}
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    {deal.product && (
                      <p className="text-sm text-gray-600 mb-2">
                        {deal.product.brand} {deal.product.model} {deal.product.storage}
                      </p>
                    )}

                    {/* Description */}
                    {deal.description && (
                      <p className="text-sm text-gray-600 mb-3">{deal.description}</p>
                    )}

                    {/* Pricing Tiers */}
                    <div className="flex gap-4 mb-3">
                      <div className="text-sm">
                        <span className="font-medium">{deal.tier_1_qty}x:</span>
                        <span className="ms-1 text-indigo-600 font-bold">₪{deal.tier_1_price.toFixed(0)}</span>
                      </div>
                      {deal.tier_2_qty && deal.tier_2_price && (
                        <div className="text-sm">
                          <span className="font-medium">{deal.tier_2_qty}x:</span>
                          <span className="ms-1 text-indigo-600 font-bold">₪{deal.tier_2_price.toFixed(0)}</span>
                        </div>
                      )}
                      {deal.tier_3_qty && deal.tier_3_price && (
                        <div className="text-sm">
                          <span className="font-medium">{deal.tier_3_qty}x:</span>
                          <span className="ms-1 text-indigo-600 font-bold">₪{deal.tier_3_price.toFixed(0)}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 text-xs text-gray-500">
                      {deal.max_quantity && (
                        <span>Sold: {deal.sold_quantity} / {deal.max_quantity}</span>
                      )}
                      {deal.payment_methods && (
                        <span>{t('deals.payment')}: {deal.payment_methods.map(m => t(`deals.paymentMethod.${m}`)).join(', ')}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(deal)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        deal.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {deal.is_active ? t('deals.active') : t('deals.inactive')}
                    </button>
                    <button
                      onClick={() => openEditModal(deal)}
                      className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(deal.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingDeal ? t('deals.edit') : t('deals.createNew')}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('deals.title')} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., במלאייי!! iPhone 16 Pro Max"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('deals.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Optional description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('deals.product')} *
                  </label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select product...</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.brand} {product.model} {product.storage}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('deals.priority')}
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    min="0"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Higher = shown first (15+ = Hot 🔥)</p>
                </div>
              </div>

              {/* Pricing Tiers */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">{t('deals.pricingTiers')}</h3>
                
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <p className="text-xs text-gray-600 mb-2">
                    💡 Tier prices are <strong>per unit</strong>. Example: 2x @ ₪4200 means 2 units for ₪4200 each (₪8400 total)
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tier 1 Quantity *
                    </label>
                    <input
                      type="number"
                      value={formData.tier_1_qty}
                      onChange={(e) => setFormData({ ...formData, tier_1_qty: parseInt(e.target.value) })}
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tier 1 Price per unit (₪) *
                    </label>
                    <input
                      type="number"
                      value={formData.tier_1_price}
                      onChange={(e) => setFormData({ ...formData, tier_1_price: parseFloat(e.target.value) })}
                      required
                      min="0"
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 4300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tier 2 Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.tier_2_qty || ''}
                      onChange={(e) => setFormData({ ...formData, tier_2_qty: e.target.value ? parseInt(e.target.value) : undefined })}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tier 2 Price per unit (₪)
                    </label>
                    <input
                      type="number"
                      value={formData.tier_2_price || ''}
                      onChange={(e) => setFormData({ ...formData, tier_2_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                      min="0"
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 4200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tier 3 Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.tier_3_qty || ''}
                      onChange={(e) => setFormData({ ...formData, tier_3_qty: e.target.value ? parseInt(e.target.value) : undefined })}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tier 3 Price per unit (₪)
                    </label>
                    <input
                      type="number"
                      value={formData.tier_3_price || ''}
                      onChange={(e) => setFormData({ ...formData, tier_3_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                      min="0"
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 4100"
                    />
                  </div>
                </div>
              </div>

              {/* Expiration */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">{t('deals.expiration')}</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Type
                    </label>
                    <select
                      value={formData.expiration_type}
                      onChange={(e) => setFormData({ ...formData, expiration_type: e.target.value as ExpirationType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="none">No Expiration</option>
                      <option value="date">By Date</option>
                      <option value="quantity">By Quantity</option>
                      <option value="both">Date & Quantity</option>
                    </select>
                  </div>

                  {(formData.expiration_type === 'date' || formData.expiration_type === 'both') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expires At
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.expires_at || ''}
                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  {(formData.expiration_type === 'quantity' || formData.expiration_type === 'both') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Quantity
                      </label>
                      <input
                        type="number"
                        value={formData.max_quantity || ''}
                        onChange={(e) => setFormData({ ...formData, max_quantity: e.target.value ? parseInt(e.target.value) : undefined })}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">{t('deals.paymentMethods')}</h3>
                <div className="space-y-2">
                  {(['cash', 'bank_transfer', 'check_week', 'check_month'] as DealPaymentMethod[]).map((method) => (
                    <label key={method} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.payment_methods.includes(method)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, payment_methods: [...formData.payment_methods, method] });
                          } else {
                            setFormData({ ...formData, payment_methods: formData.payment_methods.filter(m => m !== method) });
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{t(`deals.paymentMethod.${method}`)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('deals.notes')}
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Public notes..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end border-t pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      {editingDeal ? 'Saving...' : 'Creating...'}
                    </>
                  ) : (
                    <>{editingDeal ? t('common.save') : t('common.create')}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
}

