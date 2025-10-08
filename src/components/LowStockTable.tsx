'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, AlertTriangle } from 'lucide-react';
import { LowStockItem } from '@/lib/dashboard';

interface LowStockTableProps {
  items: LowStockItem[];
  loading?: boolean;
}

export default function LowStockTable({ items, loading = false }: LowStockTableProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [submitting, setSubmitting] = useState<string | null>(null);
  const router = useRouter();

  const handleStartEdit = (item: LowStockItem) => {
    setEditingItem(item.product_id);
    setEditValue(item.min_alert.toString());
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditValue('');
  };

  const handleSaveEdit = async (productId: string) => {
    const newMinAlert = parseInt(editValue);
    if (isNaN(newMinAlert) || newMinAlert < 0) {
      alert('Please enter a valid number');
      return;
    }

    setSubmitting(productId);
    try {
      const response = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId,
          min_stock_alert: newMinAlert,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update min stock alert');
      }

      setEditingItem(null);
      setEditValue('');
      router.refresh();
    } catch (error) {
      console.error('Failed to update min stock alert:', error);
      alert('Failed to update minimum stock alert');
    } finally {
      setSubmitting(null);
    }
  };

  const getStockStatus = (available: number, minAlert: number) => {
    if (available <= 0) return { color: 'bg-red-100 text-red-800', label: 'Out of Stock' };
    if (available <= minAlert) return { color: 'bg-red-100 text-red-800', label: 'Critical' };
    if (available <= minAlert * 1.5) return { color: 'bg-yellow-100 text-yellow-800', label: 'Low' };
    return { color: 'bg-green-100 text-green-800', label: 'Good' };
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Low Stock</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Low Stock</h3>
        </div>
        <div className="p-6 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">All products well stocked</h3>
          <p className="mt-1 text-sm text-gray-500">
            No products are below their minimum stock alert.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Low Stock ({items.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reserved
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Available
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Min Alert
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => {
              const stockStatus = getStockStatus(item.available, item.min_alert);
              const isEditing = editingItem === item.product_id;

              return (
                <tr key={item.product_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.brand} {item.model}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.storage} • {item.condition}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.reserved}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      {item.available}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                          onClick={() => handleSaveEdit(item.product_id)}
                          disabled={submitting === item.product_id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="text-sm text-gray-900 hover:text-indigo-600 cursor-pointer"
                      >
                        {item.min_alert}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      {item.available <= 0 && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {stockStatus.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {item.available <= 0 && (
                      <button
                        onClick={() => router.push('/inventory')}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Restock
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
