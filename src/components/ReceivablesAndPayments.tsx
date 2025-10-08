'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, Clock, MessageSquare } from 'lucide-react';
import { TopDebtor, RecentPayment } from '@/lib/dashboard';

interface ReceivablesAndPaymentsProps {
  debtors: TopDebtor[];
  payments: RecentPayment[];
  loading?: boolean;
}

export default function ReceivablesAndPayments({ 
  debtors, 
  payments, 
  loading = false 
}: ReceivablesAndPaymentsProps) {
  const [reminding, setReminding] = useState<string | null>(null);
  const router = useRouter();

  const handleRemind = async (clientId: string) => {
    setReminding(clientId);
    try {
      const response = await fetch('/api/dispatch-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          template: 'payment_reminder',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send payment reminder');
      }

      // Show success message
      alert('Payment reminder sent successfully');
    } catch (error) {
      console.error('Failed to send payment reminder:', error);
      alert('Failed to send payment reminder');
    } finally {
      setReminding(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  const getDaysOverdueColor = (days: number) => {
    if (days <= 0) return 'text-green-600';
    if (days <= 30) return 'text-yellow-600';
    if (days <= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Money Panel</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Money Panel</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Debtors */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Top Debtors
            </h4>
            {debtors.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No outstanding debts</p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Client
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Outstanding
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Overdue
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {debtors.slice(0, 5).map((debtor) => (
                      <tr key={debtor.client_id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">
                          <div className="font-medium text-gray-900">{debtor.client_name}</div>
                          <div className="text-gray-500 text-xs">
                            Last: {formatDate(debtor.last_payment_at)}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {formatCurrency(debtor.outstanding)}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`font-medium ${getDaysOverdueColor(debtor.days_overdue)}`}>
                            {debtor.days_overdue} days
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <button
                            onClick={() => handleRemind(debtor.client_id)}
                            disabled={reminding === debtor.client_id}
                            className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 flex items-center"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {reminding === debtor.client_id ? 'Sending...' : 'Remind'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Payments */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Payments
            </h4>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No recent payments</p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Client
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Method
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.slice(0, 10).map((payment) => (
                      <tr key={payment.payment_id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {payment.client_name}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-green-600">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 capitalize">
                          {payment.method.replace('_', ' ')}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatDate(payment.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {payments.length > 0 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => router.push('/payments')}
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  View all payments →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
