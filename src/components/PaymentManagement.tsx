'use client';

import { useEffect, useState } from 'react';
import Layout from './Layout';
import { Payment, CreatePaymentData, Client, Order, PaymentMethod } from '@/types/database';
import { getPayments, createPayment, getClients, getOrders } from '@/lib/database';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import {
  Plus,
  Search,
  Filter,
  CreditCard,
  DollarSign,
  Calendar,
  User,
  ShoppingCart
} from 'lucide-react';

export default function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<CreatePaymentData>({
    client_id: '',
    order_id: '',
    amount: 0,
    method: 'cash',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [paymentsData, clientsData, ordersData] = await Promise.all([
        getPayments(),
        getClients(),
        getOrders()
      ]);
      setPayments(paymentsData);
      setClients(clientsData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePayment() {
    try {
      const paymentData = {
        ...formData,
        order_id: formData.order_id || null
      };
      await createPayment(paymentData);
      setShowAddModal(false);
      setFormData({
        client_id: '',
        order_id: '',
        amount: 0,
        method: 'cash',
        date: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (error) {
      console.error('Failed to create payment:', error);
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
    return matchesSearch && matchesMethod;
  });

  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const methodCounts = {
    cash: payments.filter(p => p.method === 'cash').length,
    transfer: payments.filter(p => p.method === 'transfer').length,
    check: payments.filter(p => p.method === 'check').length
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
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track payments, manage debts, and monitor client payment history.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Payments</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(totalPayments)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCard className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Cash Payments</dt>
                    <dd className="text-lg font-medium text-gray-900">{methodCounts.cash}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCard className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Transfers</dt>
                    <dd className="text-lg font-medium text-gray-900">{methodCounts.transfer}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCard className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Checks</dt>
                    <dd className="text-lg font-medium text-gray-900">{methodCounts.check}</dd>
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
                  placeholder="Search payments..."
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
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="transfer">Transfer</option>
                  <option value="check">Check</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredPayments.map((payment) => (
              <li key={payment.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {payment.client?.name || 'Unknown Client'}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.method === 'cash' ? 'bg-green-100 text-green-800' :
                          payment.method === 'transfer' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.method}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <p className="text-sm text-gray-500">
                          {formatDateTime(payment.date)} • Payment #{payment.id.slice(0, 8)}
                        </p>
                      </div>
                      {payment.order && (
                        <div className="mt-1">
                          <p className="text-sm text-gray-500">
                            Order #{payment.order.id.slice(0, 8)} • {formatCurrency(payment.order.total_price)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Add Payment Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Record Payment</h3>
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
                    <label className="block text-sm font-medium text-gray-700">Order (Optional)</label>
                    <select
                      value={formData.order_id}
                      onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select an order (optional)</option>
                      {orders
                        .filter(order => order.client_id === formData.client_id)
                        .map(order => (
                          <option key={order.id} value={order.id}>
                            Order #{order.id.slice(0, 8)} - {formatCurrency(order.total_price)}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <select
                      value={formData.method}
                      onChange={(e) => setFormData({ ...formData, method: e.target.value as PaymentMethod })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="cash">Cash</option>
                      <option value="transfer">Transfer</option>
                      <option value="check">Check</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreatePayment}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Record Payment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
