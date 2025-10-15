'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Layout from './Layout';
import { 
  DailyKpis, 
  ProfitByClient, 
  BestSeller, 
  LowStockItemType 
} from '@/types/database';
import { 
  getDailyKpis, 
  getProfitByClient, 
  getBestSellers, 
  getLowStockItems 
} from '@/lib/dashboard';
import { formatCurrency, formatDate } from '@/lib/utils';
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
  Eye
} from 'lucide-react';

interface EnhancedDashboardProps {
  isAdmin?: boolean;
  showSignInPrompt?: boolean;
}

export default function EnhancedDashboard({ isAdmin = true, showSignInPrompt = false }: EnhancedDashboardProps) {
  const [dailyKpis, setDailyKpis] = useState<DailyKpis | null>(null);
  const [profitByClient, setProfitByClient] = useState<ProfitByClient[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const t = useTranslations();
  const locale = useLocale();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        if (isAdmin) {
          // Load daily KPIs
          const kpis = await getDailyKpis();
          setDailyKpis(kpis);

          // Set default date range (last 30 days)
          const to = new Date().toISOString().split('T')[0];
          const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          setDateRange({ from, to });

          // Load profit by client
          const profitData = await getProfitByClient({ from, to });
          setProfitByClient(profitData);

          // Load best sellers
          const sellers = await getBestSellers({ sinceDays: 60 });
          setBestSellers(sellers);

          // Load low stock items
          const lowStock = await getLowStockItems();
          setLowStockItems(lowStock);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [isAdmin]);

  const handleDateRangeChange = async (newFrom: string, newTo: string) => {
    setDateRange({ from: newFrom, to: newTo });
    try {
      const profitData = await getProfitByClient({ from: newFrom, to: newTo });
      setProfitByClient(profitData);
    } catch (error) {
      console.error('Failed to load profit data:', error);
    }
  };

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
              {t('auth.welcome')}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {t('auth.signInPrompt')}
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href={`/${locale}/sign-in`}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t('auth.signIn')}
              </a>
              <a
                href={`/${locale}/sign-up`}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t('auth.signUp')}
              </a>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAdmin={isAdmin}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? t('dashboard.businessDashboard') : t('dashboard.myDashboard')}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin 
              ? t('dashboard.businessWelcome')
              : t('dashboard.customerWelcome')
            }
          </p>
        </div>

        {isAdmin && dailyKpis && (
          <>
            {/* Daily KPIs */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {t('dashboard.dailyKpis')}
                </h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Package className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-600">
                          {t('dashboard.unitsSoldToday')}
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {dailyKpis.unitsSold}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-600">
                          {t('dashboard.costOfGoodsSoldToday')}
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                          {formatCurrency(dailyKpis.cost)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-purple-600">
                          {t('dashboard.totalProfitToday')}
                        </p>
                        <p className="text-2xl font-bold text-purple-900">
                          {formatCurrency(dailyKpis.profit)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BarChart3 className="h-8 w-8 text-orange-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-orange-600">
                          הכנסות היום
                        </p>
                        <p className="text-2xl font-bold text-orange-900">
                          {formatCurrency(dailyKpis.revenue)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Profit by Client */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {t('dashboard.profitByClient')}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => handleDateRangeChange(e.target.value, dateRange.to)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1"
                      />
                      <span className="text-sm text-gray-500">עד</span>
                      <input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => handleDateRangeChange(dateRange.from, e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1"
                      />
                    </div>
                  </div>
                  
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('dashboard.client')}
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('dashboard.orders')}
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('dashboard.revenue')}
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('dashboard.profit')}
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('dashboard.profitPercentage')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {profitByClient.slice(0, 10).map((client) => (
                          <tr key={client.client_id}>
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
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                              {client.profit_percentage.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Best Sellers */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {t('dashboard.bestSellers')}
                  </h3>
                  
                  <div className="space-y-3">
                    {bestSellers.map((item, index) => (
                      <div key={item.product_id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-600">
                                {index + 1}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.brand} {item.model}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.storage}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {item.quantity_sold} יחידות
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(item.revenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Low Stock and Open Orders */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Low Stock List */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {t('dashboard.lowStockList')}
                  </h3>
                  
                  <div className="space-y-3">
                    {lowStockItems.slice(0, 10).map((item) => (
                      <div key={item.product_id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.brand} {item.model}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.storage}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-600">
                            {item.available_stock} זמין
                          </p>
                          <p className="text-sm text-gray-500">
                            סף: {item.alert_threshold}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Open Orders */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {t('dashboard.openOrders')}
                  </h3>
                  
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      אין הזמנות פתוחות
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      כל ההזמנות נמסרו או נסגרו
                    </p>
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
                {t('dashboard.gettingStarted')}
              </h3>
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {t('dashboard.welcomeTitle')}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('dashboard.welcomeDesc')}
                </p>
                <div className="mt-6">
                  <a
                    href="/customer/new-order"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {t('dashboard.createFirstOrder')}
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
