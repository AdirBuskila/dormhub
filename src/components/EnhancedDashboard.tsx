'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Layout from './Layout';
import KpiCard from './KpiCard';
import { 
  DailyKpis, 
  ProfitByClient, 
  BestSeller, 
  LowStockItemType 
} from '@/types/database';
import { 
  getSalesSummary,
  getTopProducts,
  getTopClients,
  getLowStockAlerts,
  getSalesTrend,
  getProfitByBrand,
  getRecentAlerts
} from '@/lib/dashboard';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  BarChart3,
  Star,
  Eye,
  Plus,
  Settings,
  Bell,
  MessageCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface EnhancedDashboardProps {
  isAdmin?: boolean;
  showSignInPrompt?: boolean;
}

interface SalesSummary {
  today: { revenue: number; cost: number; profit: number; orders: number };
  month: { revenue: number; cost: number; profit: number; orders: number };
}

interface SalesTrendData {
  date: string;
  revenue: number;
  orders: number;
}

interface ProfitByBrandData {
  brand: string;
  profit: number;
  percentage: number;
}

interface RecentAlert {
  id: string;
  type: string;
  message: string;
  severity: string;
  created_at: string;
  delivered: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function EnhancedDashboard({ isAdmin = true, showSignInPrompt = false }: EnhancedDashboardProps) {
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [topProducts, setTopProducts] = useState<BestSeller[]>([]);
  const [topClients, setTopClients] = useState<ProfitByClient[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockItemType[]>([]);
  const [salesTrend, setSalesTrend] = useState<SalesTrendData[]>([]);
  const [profitByBrand, setProfitByBrand] = useState<ProfitByBrandData[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('dashboard');
  const tAuth = useTranslations('auth');
  const locale = useLocale();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        if (isAdmin) {
          // Load all dashboard data in parallel
          const [
            summary,
            products,
            clients,
            alerts,
            trend,
            brandProfit,
            alertsData
          ] = await Promise.all([
            getSalesSummary(),
            getTopProducts({ limit: 10 }),
            getTopClients({ limit: 10 }),
            getLowStockAlerts({ limit: 10 }),
            getSalesTrend(),
            getProfitByBrand(),
            getRecentAlerts({ limit: 5 })
          ]);

          setSalesSummary(summary);
          setTopProducts(products);
          setTopClients(clients);
          setLowStockAlerts(alerts);
          setSalesTrend(trend);
          setProfitByBrand(brandProfit);
          setRecentAlerts(alertsData);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [isAdmin]);

  if (loading) {
    return (
      <Layout isAdmin={isAdmin}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (showSignInPrompt) {
    return (
      <Layout isAdmin={false}>
        <div className="space-y-6">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {tAuth('welcome')}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {tAuth('signInPrompt')}
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href={`/${locale}/sign-in`}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {tAuth('signIn')}
              </a>
              <a
                href={`/${locale}/sign-up`}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {tAuth('signUp')}
              </a>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAdmin={isAdmin}>
      <div className="space-y-6" dir={locale === 'he' ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isAdmin ? t('businessDashboard') : t('myDashboard')}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isAdmin 
                ? t('businessWelcome')
                : t('customerWelcome')
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('he-IL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>

        {isAdmin && salesSummary && (
          <>
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                title={t('revenueToday')}
                value={salesSummary.today.revenue}
                icon={DollarSign}
                formatter={formatCurrency}
                iconColor="text-blue-600"
                bgColor="bg-blue-50"
                textColor="text-blue-900"
                href="/orders"
              />
              <KpiCard
                title={t('costToday')}
                value={salesSummary.today.cost}
                icon={TrendingUp}
                formatter={formatCurrency}
                iconColor="text-yellow-600"
                bgColor="bg-yellow-50"
                textColor="text-yellow-900"
                href="/inventory"
              />
              <KpiCard
                title={t('profitToday')}
                value={salesSummary.today.profit}
                icon={BarChart3}
                formatter={formatCurrency}
                iconColor="text-green-600"
                bgColor="bg-green-50"
                textColor="text-green-900"
                href="/orders"
              />
              <KpiCard
                title={t('ordersToday')}
                value={salesSummary.today.orders}
                icon={ShoppingCart}
                formatter={(val) => val.toString()}
                iconColor="text-gray-600"
                bgColor="bg-gray-50"
                textColor="text-gray-900"
                href="/orders"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* 7-Day Sales Trend */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t('salesTrend7Days')}
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any, name: string) => [
                          name === 'revenue' ? formatCurrency(value) : value,
                          name === 'revenue' ? t('revenue') : t('orders')
                        ]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        name="revenue"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="orders" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        name="orders"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Profit Distribution by Brand */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t('profitByBrand')}
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={profitByBrand}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ brand, percentage }) => `${brand} (${percentage.toFixed(1)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="profit"
                      >
                        {profitByBrand.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [formatCurrency(value), t('profit')]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Tables Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Top Products */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {t('topProducts')}
                    </h3>
                    <Link
                      href="/inventory"
                      className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
                    >
                      {t('viewAll')}
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    </Link>
                  </div>
                  
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('product')}
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('sold')}
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('revenue')}
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('profit')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {topProducts.map((product, index) => (
                          <tr key={product.product_id} className="hover:bg-gray-50 cursor-pointer">
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-indigo-600">
                                      {index + 1}
                                    </span>
                                  </div>
                                </div>
                                <div className="mr-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    {product.brand} {product.model}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {product.storage}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.quantity_sold}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(product.revenue)}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(product.revenue * 0.2)} {/* Estimated 20% profit */}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Top Clients */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {t('topClients')}
                    </h3>
                    <Link
                      href="/clients"
                      className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
                    >
                      {t('viewAll')}
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    </Link>
                  </div>
                  
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('client')}
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('orders')}
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('totalSpent')}
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('profit')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {topClients.map((client) => (
                          <tr key={client.client_id} className="hover:bg-gray-50 cursor-pointer">
                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {client.client_name}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                              {client.orders}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(client.revenue)}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(client.profit)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts and Quick Actions */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Alerts Summary */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {t('alerts')}
                    </h3>
                    <Bell className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-3">
                    {recentAlerts.length > 0 ? (
                      recentAlerts.map((alert) => (
                        <div key={alert.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {alert.severity === 'danger' ? (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            ) : alert.severity === 'warning' ? (
                              <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            ) : (
                              <CheckCircle className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">
                              {alert.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(alert.created_at).toLocaleDateString('he-IL')}
                            </p>
                          </div>
                          {alert.delivered && (
                            <MessageCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <CheckCircle className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          {t('noAlerts')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Low Stock Alerts */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {t('lowStockAlerts')}
                    </h3>
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  </div>
                  
                  <div className="space-y-3">
                    {lowStockAlerts.length > 0 ? (
                      lowStockAlerts.map((item) => (
                        <div key={item.product_id} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.brand} {item.model}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.storage}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-red-600">
                              {item.available_stock} זמין
                            </p>
                            <p className="text-xs text-gray-500">
                              סף: {item.alert_threshold}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <CheckCircle className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          {t('noLowStock')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {t('quickActions')}
                  </h3>
                  
                  <div className="space-y-3">
                    <Link
                      href="/inventory"
                      className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="h-5 w-5 text-indigo-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">
                        {t('addProduct')}
                      </span>
                    </Link>
                    
                    <Link
                      href="/inventory"
                      className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="h-5 w-5 text-indigo-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">
                        {t('manageInventory')}
                      </span>
                    </Link>
                    
                    <Link
                      href="/orders"
                      className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <ShoppingCart className="h-5 w-5 text-indigo-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">
                        {t('viewOrders')}
                      </span>
                    </Link>
                    
                    <Link
                      href="/clients"
                      className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <Users className="h-5 w-5 text-indigo-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">
                        {t('viewClients')}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Customer Dashboard */}
        {!isAdmin && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {t('gettingStarted')}
              </h3>
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {t('welcomeTitle')}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('welcomeDesc')}
                </p>
                <div className="mt-6">
                  <a
                    href="/customer/new-order"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {t('createFirstOrder')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}