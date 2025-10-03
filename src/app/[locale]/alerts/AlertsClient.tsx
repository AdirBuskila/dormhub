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
  Play, 
  Send, 
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

  const handleRunAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/run-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`Alerts created: ${result.total} total\n- Low Stock: ${result.lowStock}\n- Undelivered: ${result.undelivered}\n- Overdue: ${result.overdue}\n- Reserved Stale: ${result.reservedStale}`);
        // Refresh the page to show new alerts
        window.location.reload();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dispatch-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`Messages processed: ${result.processed}\nRemaining: ${result.remaining}`);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('navigation.alerts')}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage system alerts and notifications
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {unreadAlerts}
              </div>
              <div className="text-sm text-gray-500">
                Unread alerts
              </div>
            </div>
            <button
              onClick={refreshAlerts}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh alerts"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
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
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Alerts
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
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Unread
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
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Delivered
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
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Filtered
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

        {/* Action Buttons */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Alert Management
          </h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleRunAlerts}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4 mr-2" />
              Run Alerts Now
            </button>
            
            <button
              onClick={handleDispatchMessages}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4 mr-2" />
              Dispatch Queued Messages
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Filters
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as AlertType | 'all')}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Types</option>
                <option value="low_stock">Low Stock</option>
                <option value="undelivered">Undelivered</option>
                <option value="overdue_payment">Overdue Payment</option>
                <option value="reserved_stale">Reserved Stale</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity
              </label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value as AlertSeverity | 'all')}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Severities</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="danger">Danger</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterDelivered}
                onChange={(e) => setFilterDelivered(e.target.value as 'all' | 'delivered' | 'undelivered')}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Status</option>
                <option value="undelivered">Unread</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Alerts ({filteredAlerts.length})
            </h3>
            
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No alerts found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your filters or run alerts to generate new ones.
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
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500">
                              {alert.type.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900">
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(alert.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!alert.delivered && (
                          <button
                            onClick={() => markAsDelivered(alert.id)}
                            className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            Mark as delivered
                          </button>
                        )}
                        {alert.delivered && (
                          <span className="text-sm text-green-600 font-medium">
                            ✓ Delivered
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

