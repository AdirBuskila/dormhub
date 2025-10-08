'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, CreditCard, Eye } from 'lucide-react';
import { OrderToDeliver } from '@/lib/dashboard';

interface OrdersToDeliverTableProps {
  orders: OrderToDeliver[];
  loading?: boolean;
}

interface PaymentModalProps {
  orderId: string;
  clientName: string;
  balanceDue: number;
  onClose: () => void;
  onSubmit: (amount: number, method: string) => Promise<void>;
}

function PaymentModal({ orderId, clientName, balanceDue, onClose, onSubmit }: PaymentModalProps) {
  const [amount, setAmount] = useState(balanceDue.toString());
  const [method, setMethod] = useState('cash');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(parseFloat(amount), method);
      onClose();
    } catch (error) {
      console.error('Failed to log payment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Log Payment - {clientName}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Payment Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="cash">Cash</option>
                <option value="credit">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {submitting ? 'Logging...' : 'Log Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function OrdersToDeliverTable({ orders, loading = false }: OrdersToDeliverTableProps) {
  const [paymentModal, setPaymentModal] = useState<{ orderId: string; clientName: string; balanceDue: number } | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const router = useRouter();

  const handleMarkDelivered = async (orderId: string) => {
    setSubmitting(orderId);
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: 'delivered' }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Failed to mark as delivered:', error);
      alert('Failed to mark order as delivered');
    } finally {
      setSubmitting(null);
    }
  };

  const handleLogPayment = async (amount: number, method: string) => {
    if (!paymentModal) return;

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: paymentModal.orderId, // This should be client ID, but for now using order ID
          amount,
          method,
          date: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to log payment');
      }

      router.refresh();
    } catch (error) {
      console.error('Failed to log payment:', error);
      throw error;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Orders to Deliver</h3>
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

  if (orders.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Orders to Deliver</h3>
        </div>
        <div className="p-6 text-center">
          <Truck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders to deliver</h3>
          <p className="mt-1 text-sm text-gray-500">
            All orders are up to date.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Orders to Deliver ({orders.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Promised
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance Due
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.order_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.order_id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.client_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.items_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(order.promised_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'reserved' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(order.balance_due)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleMarkDelivered(order.order_id)}
                      disabled={submitting === order.order_id}
                      className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                      title="Mark Delivered"
                    >
                      <Truck className="h-4 w-4" />
                    </button>
                    {order.balance_due > 0 && (
                      <button
                        onClick={() => setPaymentModal({
                          orderId: order.order_id,
                          clientName: order.client_name,
                          balanceDue: order.balance_due
                        })}
                        className="text-green-600 hover:text-green-900"
                        title="Log Payment"
                      >
                        <CreditCard className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => router.push(`/orders?orderId=${order.order_id}`)}
                      className="text-gray-600 hover:text-gray-900"
                      title="Open Order"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {paymentModal && (
        <PaymentModal
          orderId={paymentModal.orderId}
          clientName={paymentModal.clientName}
          balanceDue={paymentModal.balanceDue}
          onClose={() => setPaymentModal(null)}
          onSubmit={handleLogPayment}
        />
      )}
    </>
  );
}
