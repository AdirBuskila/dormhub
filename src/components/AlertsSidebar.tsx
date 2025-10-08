'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, AlertTriangle, AlertCircle, Info, MessageSquare } from 'lucide-react';
import { RecentAlert } from '@/lib/dashboard';

interface AlertsSidebarProps {
  alerts: RecentAlert[];
  loading?: boolean;
}

export default function AlertsSidebar({ alerts, loading = false }: AlertsSidebarProps) {
  const [runningAlerts, setRunningAlerts] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [acknowledging, setAcknowledging] = useState<string | null>(null);
  const router = useRouter();

  const handleRunAlerts = async () => {
    setRunningAlerts(true);
    try {
      const response = await fetch('/api/run-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to run alerts');
      }

      router.refresh();
    } catch (error) {
      console.error('Failed to run alerts:', error);
      alert('Failed to run alerts');
    } finally {
      setRunningAlerts(false);
    }
  };

  const handleDispatchMessages = async () => {
    setDispatching(true);
    try {
      const response = await fetch('/api/dispatch-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to dispatch messages');
      }

      router.refresh();
    } catch (error) {
      console.error('Failed to dispatch messages:', error);
      alert('Failed to dispatch messages');
    } finally {
      setDispatching(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    setAcknowledging(alertId);
    try {
      const response = await fetch('/api/alerts/mark-delivered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      });

      if (!response.ok) {
        throw new Error('Failed to acknowledge alert');
      }

      router.refresh();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      alert('Failed to acknowledge alert');
    } finally {
      setAcknowledging(null);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const alertDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
      </div>
      
      {/* Action Buttons */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="space-y-2">
          <button
            onClick={handleRunAlerts}
            disabled={runningAlerts}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Bell className="h-4 w-4 mr-2" />
            {runningAlerts ? 'Running...' : 'Run Alerts'}
          </button>
          <button
            onClick={handleDispatchMessages}
            disabled={dispatching}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {dispatching ? 'Dispatching...' : 'Dispatch Messages'}
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="p-6">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No recent alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)} ${
                  alert.delivered ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2 flex-1">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {alert.type}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          alert.severity === 'low' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatRelativeTime(alert.created_at)}
                      </p>
                    </div>
                  </div>
                  {!alert.delivered && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      disabled={acknowledging === alert.id}
                      className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      title="Acknowledge"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
