'use client';

import Link from 'next/link';
import { Package, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    brand: string;
    model: string;
    storage: string;
  };
}

interface Order {
  id: string;
  status: string;
  total_price: number;
  created_at: string;
  order_items: OrderItem[];
}

interface OrderConfirmationProps {
  order: Order;
}

export default function OrderConfirmation({ order }: OrderConfirmationProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'reserved':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Your order has been delivered successfully!';
      case 'reserved':
        return 'Your order has been reserved and is ready for delivery.';
      case 'draft':
        return 'Your order has been received and is being processed.';
      default:
        return 'Your order is being processed.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href="/customer"
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order Confirmation
                </h1>
                <p className="text-gray-600">
                  Order #{order.id.slice(0, 8)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(order.status)}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {getStatusIcon(order.status)}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">
                {getStatusMessage(order.status)}
              </h3>
              <p className="text-sm text-gray-500">
                Created on {formatDate(order.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Order Details</h2>
          </div>
          <div className="px-6 py-4">
            <ul className="divide-y divide-gray-200">
              {order.order_items.map((item) => (
                <li key={item.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {item.product.brand} {item.product.model}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {item.product.storage} • Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm text-gray-900">
                      ${item.price * item.quantity}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">
                  ${order.total_price}
                </span>
              </div>
              {order.total_price === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Final pricing will be provided before delivery.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/customer"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
