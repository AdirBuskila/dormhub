'use client';

import Link from 'next/link';
import Layout from '@/components/Layout';
import { Package, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations();

  // Safety check for order data
  if (!order || !order.id) {
    return (
      <Layout isAdmin={false}>
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-900">Invalid Order Data</h2>
            <p className="mt-2 text-red-700">The order information is missing or invalid.</p>
          </div>
        </div>
      </Layout>
    );
  }
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
        return t('customer.orderDelivered');
      case 'reserved':
        return t('customer.orderReserved');
      case 'draft':
        return t('customer.orderProcessed');
      default:
        return t('customer.orderBeingProcessed');
    }
  };

  return (
    <Layout isAdmin={false}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
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
                  {t('customer.orderConfirmation')}
                </h1>
                <p className="text-gray-600">
                  Order #{order.id.slice(0, 8)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(order.status)}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {t(`orders.orderStatus.${order.status}`)}
              </span>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="bg-white shadow rounded-lg p-6">
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
            {order.order_items && order.order_items.length > 0 ? (
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Product Header */}
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex-shrink-0">
                            {item.product?.image_url ? (
                              <img
                                src={item.product.image_url}
                                alt={`${item.product.brand} ${item.product.model}`}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-indigo-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-semibold text-gray-900 leading-tight mb-1">
                              {item.product?.brand} {item.product?.model}
                            </h4>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 font-medium">Storage:</span>
                            <span className="text-sm text-gray-900">{item.product?.storage}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 font-medium">Condition:</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              item.product?.condition === 'new' ? 'bg-blue-100 text-blue-800' :
                              item.product?.condition === 'refurbished' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.product?.condition}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 font-medium">Category:</span>
                            <span className="text-sm text-gray-900 capitalize">{item.product?.category}</span>
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex-shrink-0 ml-4 text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          ${item.price * item.quantity}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-sm text-gray-500">
                            ${item.price} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No items found in this order.</p>
              </div>
            )}

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
    </Layout>
  );
}
