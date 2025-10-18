'use client';

import { useEffect, useState } from 'react';
import Layout from './Layout';
import { Order, CreateOrderData, Product, Client } from '@/types/database';
import { getOrders, createOrder, updateOrderStatus, getProducts, getClients } from '@/lib/database';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import {
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  Package,
  ShoppingCart
} from 'lucide-react';

interface OrderManagementProps {
  isAdmin?: boolean;
}

export default function OrderManagement({ isAdmin = true }: OrderManagementProps) {
  const t = useTranslations('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState<CreateOrderData>({
    client_id: '',
    notes: '',
    items: []
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [ordersData, productsData, clientsData] = await Promise.all([
        getOrders(),
        getProducts(),
        getClients()
      ]);
      setOrders(ordersData);
      setProducts(productsData);
      setClients(clientsData);
    } catch (error) {
      console.warn('Some data failed to load, using empty arrays:', error);
      // Set empty arrays as fallback
      setOrders([]);
      setProducts([]);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateOrder() {
    try {
      await createOrder(formData);
      setShowCreateModal(false);
      setFormData({
        client_id: '',
        notes: '',
        items: []
      });
      loadData();
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  }

  async function handleUpdateStatus(orderId: string, status: string) {
    try {
      await updateOrderStatus(orderId, status);
      loadData();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  }

  function addOrderItem() {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: '', quantity: 1, price: 0 }]
    });
  }

  function updateOrderItem(index: number, field: string, value: any) {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate price if product is selected
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        // Implement pricing logic based on category
        let basePrice = 50; // default for accessories
        
        if (['iphone', 'samsung', 'android_phone'].includes(product.category)) {
          basePrice = 500;
        } else if (product.category === 'tablet') {
          basePrice = 400;
        } else if (product.category === 'smartwatch') {
          basePrice = 300;
        } else if (product.category === 'earphones') {
          basePrice = 100;
        } else if (product.category === 'chargers') {
          basePrice = 30;
        } else if (product.category === 'cases') {
          basePrice = 40;
        }
        
        newItems[index].price = basePrice;
      }
    }
    
    setFormData({ ...formData, items: newItems });
  }

  function removeOrderItem(index: number) {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    draft: orders.filter(o => o.status === 'draft').length,
    reserved: orders.filter(o => o.status === 'reserved').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    closed: orders.filter(o => o.status === 'closed').length
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAdmin={isAdmin}>
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('orderManagement')}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('orderManagementDesc')}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('createOrder')}
            </button>
          </div>
        </div>

        {/* Status Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{t('draft')}</dt>
                    <dd className="text-lg font-medium text-gray-900">{statusCounts.draft}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{t('reserved')}</dt>
                    <dd className="text-lg font-medium text-gray-900">{statusCounts.reserved}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{t('delivered')}</dt>
                    <dd className="text-lg font-medium text-gray-900">{statusCounts.delivered}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingCart className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{t('closed')}</dt>
                    <dd className="text-lg font-medium text-gray-900">{statusCounts.closed}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={t('searchOrders')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">{t('allStatus')}</option>
                  <option value="draft">{t('draft')}</option>
                  <option value="reserved">{t('reserved')}</option>
                  <option value="delivered">{t('delivered')}</option>
                  <option value="closed">{t('closed')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {/* Empty State */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 px-4">
              <ShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {orders.length === 0 ? t('noOrdersYet') : t('noMatchingOrders')}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {orders.length === 0 ? t('ordersWillAppear') : t('tryAdjustingFilters')}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredOrders.map((order, index) => {
                // Find the actual order number based on the full orders array
                const actualOrderIndex = orders.findIndex(o => o.id === order.id);
                const orderNumber = orders.length - actualOrderIndex;
                
                return (
                <li key={order.id}>
                  <div 
                    className="px-4 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-indigo-600">#{orderNumber}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {order.client?.name || 'Unknown Client'}
                          </p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <p className="text-sm text-gray-500">
                            Order #{orderNumber} • {new Date(order.created_at).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-gray-500">
                            {order.order_items?.length || 0} items • {formatCurrency(order.total_price)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.total_price)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.order_items?.length || 0} items
                        </p>
                      </div>
                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        {order.status === 'draft' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'reserved')}
                            className="text-yellow-600 hover:text-yellow-900 px-2 py-1 text-xs font-medium"
                          >
                            {t('reserve')}
                          </button>
                        )}
                        {order.status === 'reserved' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'delivered')}
                            className="text-green-600 hover:text-green-900 px-2 py-1 text-xs font-medium"
                          >
                            Deliver
                          </button>
                        )}
                        {order.status === 'delivered' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'closed')}
                            className="text-blue-600 hover:text-blue-900 px-2 py-1 text-xs font-medium"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Create Order Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Order</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Client</label>
                    <select
                      value={formData.client_id}
                      onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select a client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Order Items</label>
                      <button
                        type="button"
                        onClick={addOrderItem}
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        + Add Item
                      </button>
                    </div>
                    
                    {formData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                        <div className="col-span-5">
                          <select
                            value={item.product_id}
                            onChange={(e) => updateOrderItem(index, 'product_id', e.target.value)}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            <option value="">Select product</option>
                            {products.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.brand} {product.model} ({product.storage})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            placeholder="Price"
                            value={item.price}
                            onChange={(e) => updateOrderItem(index, 'price', parseFloat(e.target.value) || 0)}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <button
                            type="button"
                            onClick={() => removeOrderItem(index)}
                            className="w-full text-red-600 hover:text-red-500 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateOrder}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
{t('createOrder')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
            onClick={() => setSelectedOrder(null)}
          >
            <div 
              className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Order #{orders.length - orders.findIndex(o => o.id === selectedOrder.id)} Details
                  </h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Client</h4>
                      <p className="text-sm text-gray-900">{selectedOrder.client?.name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Status</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Order Date</h4>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedOrder.created_at).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Total Price</h4>
                      <p className="text-sm text-gray-900 font-semibold">{formatCurrency(selectedOrder.total_price)}</p>
                    </div>
                  </div>
                  {selectedOrder.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedOrder.notes}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Order Items</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedOrder.order_items?.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {item.product?.brand} {item.product?.model} ({item.product?.storage})
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.price)}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                                {formatCurrency(item.price * item.quantity)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                              Total:
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                              {formatCurrency(selectedOrder.total_price)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4 mt-4 border-t">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
