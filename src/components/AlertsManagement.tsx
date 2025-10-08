'use client';

import { useEffect, useState } from 'react';
import Layout from './Layout';
import { DashboardStats } from '@/types/database';
import { getDashboardStats } from '@/lib/database';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  AlertTriangle,
  Package,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Bell
} from 'lucide-react';

interface AlertsManagementProps {
  isAdmin?: boolean;
}

export default function AlertsManagement({ isAdmin = true }: AlertsManagementProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Failed to load alerts</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </Layout>
    );
  }

  const alerts = [
    {
      id: 'low-stock',
      title: 'Low Stock Alerts',
      count: stats.lowStockItems,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      items: stats.lowStockProducts.map(product => ({
        id: product.id,
        title: `${product.brand} ${product.model}`,
        description: `Only ${product.total_stock} left (min: ${product.min_stock_alert})`,
        severity: 'warning'
      }))
    },
    {
      id: 'orders-delivery',
      title: 'Orders to Deliver Today',
      count: stats.ordersToDeliverToday,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      items: stats.recentOrders
        .filter(order => order.status === 'reserved')
        .map(order => ({
          id: order.id,
          title: `Order for ${order.client?.name}`,
          description: `${formatCurrency(order.total_price)} • ${order.order_items?.length || 0} items`,
          severity: 'info'
        }))
    },
    {
      id: 'overdue-payments',
      title: 'Overdue Payments',
      count: stats.overduePayments.length,
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      items: stats.overduePayments.map(payment => ({
        id: payment.id,
        title: `Payment from ${payment.client?.name}`,
        description: `${formatCurrency(payment.amount)} • ${formatDate(payment.date)}`,
        severity: 'error'
      }))
    },
    {
      id: 'outstanding-debts',
      title: 'Outstanding Debts',
      count: stats.outstandingDebts > 0 ? 1 : 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      items: stats.outstandingDebts > 0 ? [{
        id: 'total-debt',
        title: 'Total Outstanding Debt',
        description: formatCurrency(stats.outstandingDebts),
        severity: 'error'
      }] : []
    }
  ];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-red-800 bg-red-100';
      case 'warning':
        return 'text-yellow-800 bg-yellow-100';
      case 'info':
        return 'text-blue-800 bg-blue-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  return (
    <Layout isAdmin={isAdmin}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor important business alerts and take action when needed.
          </p>
        </div>

        {/* Alert Summary */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          {alerts.map((alert) => (
            <div key={alert.id} className={`bg-white overflow-hidden shadow rounded-lg border-l-4 ${alert.borderColor}`}>
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-md ${alert.bgColor}`}>
                      <alert.icon className={`h-6 w-6 ${alert.color}`} />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{alert.title}</dt>
                      <dd className="text-lg font-medium text-gray-900">{alert.count}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Alerts */}
        <div className="space-y-6">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <alert.icon className={`h-5 w-5 mr-2 ${alert.color}`} />
                    {alert.title}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    alert.count > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {alert.count} {alert.count === 1 ? 'alert' : 'alerts'}
                  </span>
                </div>
                
                {alert.items.length > 0 ? (
                  <div className="space-y-3">
                    {alert.items.map((item) => (
                      <div key={item.id} className="flex items-start p-3 bg-gray-50 rounded-md">
                        <div className="flex-shrink-0 mr-3">
                          {getSeverityIcon(item.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(item.severity)}`}>
                            {item.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Everything looks good in this category.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-300 hover:border-gray-400">
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
                    <Package className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" />
                    Restock Items
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Add inventory for low stock items
                  </p>
                </div>
              </button>

              <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-300 hover:border-gray-400">
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                    <ShoppingCart className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" />
                    Process Orders
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Mark orders as delivered
                  </p>
                </div>
              </button>

              <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-300 hover:border-gray-400">
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-red-50 text-red-700 ring-4 ring-white">
                    <DollarSign className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" />
                    Collect Payments
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Follow up on overdue payments
                  </p>
                </div>
              </button>

              <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-300 hover:border-gray-400">
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                    <CheckCircle className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" />
                    Mark All Read
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Clear all current alerts
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
