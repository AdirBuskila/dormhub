'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { Alert, AlertType, AlertSeverity } from '@/types/database';
import { useTranslations } from 'next-intl';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  AlertCircle, 
  Check, 
  Filter,
  RefreshCw
} from 'lucide-react';

interface AlertsClientProps {
  initialAlerts: Alert[];
  totalAlerts: number;
  unreadAlerts: number;
}

export default function AlertsClient({ initialAlerts, totalAlerts, unreadAlerts }: AlertsClientProps) {
  const t = useTranslations();
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<AlertType | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'all'>('all');
  const [filterDelivered, setFilterDelivered] = useState<'all' | 'delivered' | 'undelivered'>('all');

  // Function to translate alert messages
  const translateAlertMessage = (message: string, type: AlertType): string => {
    try {
      // Order undelivered: "Order #c049748c has been undelivered for 3 days"
      if (type === 'undelivered' && message.includes('has been undelivered for')) {
        const match = message.match(/Order #(\w+) has been undelivered for (\d+) days?/);
        if (match) {
          const [, orderId, days] = match;
          return t('alerts.messages.orderUndelivered', { orderId, days });
        }
      }

      // Reserved stale: "Order #c049748c has been in draft status for 3 days"
      if (type === 'reserved_stale' && message.includes('has been in draft status for')) {
        const match = message.match(/Order #(\w+) has been in draft status for (\d+) days?/);
        if (match) {
          const [, orderId, days] = match;
          return t('alerts.messages.orderDraftStale', { orderId, days });
        }
      }

      // New order: "New order #ff79b900 from shosh with 1 items"
      if (type === 'new_order' && message.includes('New order')) {
        const match = message.match(/New order #(\w+) from (.+?) with (\d+) items?/);
        if (match) {
          const [, orderId, clientName, items] = match;
          return t('alerts.messages.newOrder', { orderId, clientName, items });
        }
      }

      // Low stock: "Apple iPhone 11 has low stock: 4 remaining (min: 5)"
      if (type === 'low_stock' && message.includes('has low stock')) {
        const match = message.match(/(.+?) has low stock: (\d+) remaining \(min: (\d+)\)/);
        if (match) {
          const [, productName, remaining, minimum] = match;
          return t('alerts.messages.lowStockProduct', { productName, remaining, minimum });
        }
      }

      // Overdue payment: match pattern if it exists
      if (type === 'overdue_payment' && message.includes('overdue')) {
        const match = message.match(/Payment overdue from (.+?): (.+?) \((\d+) days overdue\)/);
        if (match) {
          const [, clientName, amount, days] = match;
          return t('alerts.messages.overduePayment', { clientName, amount, days });
        }
      }

      // If no match, return original message
      return message;
    } catch (error) {
      // If translation fails, return original message
      return message;
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'danger':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'danger':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filterType !== 'all' && alert.type !== filterType) return false;
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    if (filterDelivered === 'delivered' && !alert.delivered) return false;
    if (filterDelivered === 'undelivered' && alert.delivered) return false;
    return true;
  });

  const markAsDelivered = async (alertId: string) => {
    try {
      const response = await fetch('/api/alerts/mark-delivered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId })
      });

      if (response.ok) {
        setAlerts(alerts.map(alert => 
          alert.id === alertId ? { ...alert, delivered: true } : alert
        ));
      }
    } catch (error) {
      console.error('Error marking alert as delivered:', error);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/alerts/mark-all-delivered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      
      if (response.ok) {
        // Update all undelivered alerts in the state
        setAlerts(alerts.map(alert => ({ ...alert, delivered: true })));
        window.location.reload();
      } else {
        alert(`${t('common.error')}: ${result.error}`);
      }
    } catch (error) {
      alert(`${t('common.error')}: ${error instanceof Error ? error.message : t('common.error')}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshAlerts = async () => {
    setLoading(true);
    try {
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout isAdmin={true}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('alerts.alertsManagement')}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('alerts.manageAlertsDescription')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {unreadAlerts}
              </div>
              <div className="text-sm text-gray-500">
                {t('alerts.unreadAlerts')}
              </div>
            </div>
            <button
              onClick={refreshAlerts}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title={t('alerts.refresh')}
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={markAllAsRead}
              disabled={loading || unreadAlerts === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4 me-2" />
              {t('alerts.markAllAsRead')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bell className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('alerts.totalAlerts')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {totalAlerts}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('alerts.unread')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {unreadAlerts}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Check className="h-6 w-6 text-green-400" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('alerts.delivered')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {totalAlerts - unreadAlerts}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Filter className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('alerts.filtered')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {filteredAlerts.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('alerts.filters')}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('alerts.type')}
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as AlertType | 'all')}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">{t('alerts.allTypes')}</option>
                <option value="low_stock">{t('alerts.lowStock')}</option>
                <option value="undelivered">{t('alerts.undelivered')}</option>
                <option value="overdue_payment">{t('alerts.overduePayment')}</option>
                <option value="reserved_stale">{t('alerts.reservedStale')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('alerts.severity')}
              </label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value as AlertSeverity | 'all')}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">{t('alerts.allSeverities')}</option>
                <option value="info">{t('alerts.info')}</option>
                <option value="warning">{t('alerts.warning')}</option>
                <option value="danger">{t('alerts.danger')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('alerts.status')}
              </label>
              <select
                value={filterDelivered}
                onChange={(e) => setFilterDelivered(e.target.value as 'all' | 'delivered' | 'undelivered')}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">{t('alerts.allStatus')}</option>
                <option value="undelivered">{t('alerts.unread')}</option>
                <option value="delivered">{t('alerts.delivered')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {t('alerts.alertsList')} ({filteredAlerts.length})
            </h3>
            
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {t('alerts.noAlertsFound')}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('alerts.adjustFilters')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`border rounded-lg p-4 ${
                      alert.delivered 
                        ? 'border-gray-200 bg-gray-50' 
                        : 'border-l-4 border-l-indigo-500 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                              {t(`alerts.${alert.severity}`).toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500">
                              {t(`alerts.types.${alert.type}`).toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900">
                            {translateAlertMessage(alert.message, alert.type)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(alert.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!alert.delivered && (
                          <button
                            onClick={() => markAsDelivered(alert.id)}
                            className="text-sm text-indigo-600 hover:text-indigo-900 font-medium whitespace-nowrap"
                          >
                            {t('alerts.markAsDelivered')}
                          </button>
                        )}
                        {alert.delivered && (
                          <span className="text-sm text-green-600 font-medium whitespace-nowrap">
                            ✓ {t('alerts.delivered')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}


