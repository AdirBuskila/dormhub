'use client';

import Image from 'next/image';
import { useState } from 'react';
import { CartItem } from './NewOrderPage';
import { Package, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CartSidebarProps {
  items: CartItem[];
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onSubmit: (paymentMethod: string, paymentOtherText?: string) => void;
  submitting: boolean;
}

export default function CartSidebar({
  items,
  onQuantityChange,
  onRemove,
  onSubmit,
  submitting
}: CartSidebarProps) {
  const t = useTranslations();
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentOtherText, setPaymentOtherText] = useState<string>('');
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.quantity * 0), 0); // Using 0 for MVP
  
  const handleSubmit = () => {
    if (!paymentMethod) {
      alert(t('customer.paymentMethodRequired'));
      return;
    }
    if (paymentMethod === 'other' && !paymentOtherText.trim()) {
      alert(t('customer.paymentMethodRequired'));
      return;
    }
    onSubmit(paymentMethod, paymentMethod === 'other' ? paymentOtherText : undefined);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            {t('customer.shoppingCart')}
          </h2>
          <span className="text-sm text-gray-500">
            {totalItems} {totalItems !== 1 ? t('customer.items') : t('customer.item')}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('customer.yourCartIsEmpty')}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('customer.addSomeProducts')}
            </p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {items.map((item, index) => (
                <div key={`${item.product.id}-${item.isDeal ? item.dealInfo?.dealId : 'regular'}-${index}`} className="flex items-start space-x-3 border-b border-gray-200 pb-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {item.product.image_url ? (
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={item.product.image_url}
                          alt={`${item.product.brand} ${item.product.model}`}
                          fill
                          sizes="48px"
                          className="object-cover"
                          placeholder="blur"
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2UwZTBlMCIvPjwvc3ZnPg=="
                        />
                      </div>
                    ) : null}
                    <div 
                      className={`h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center ${item.product.image_url ? 'hidden' : 'flex'}`}
                    >
                      <Package className="h-6 w-6 text-gray-500" />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.product.brand} {item.product.model}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {item.product.storage} • {item.product.condition}
                    </p>
                    {item.isDeal && item.dealInfo && (
                      <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 border border-orange-300">
                        🔥 {t('deals.hotDeal')} • {item.dealInfo.tierQty}x @ ₪{item.dealInfo.tierPrice.toFixed(0)}
                      </div>
                    )}
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => onQuantityChange(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => onQuantityChange(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.total_stock}
                        className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onRemove(item.product.id)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-gray-900">{t('customer.totalItems')}:</span>
                  <span className="text-lg font-semibold text-gray-900">{totalItems}</span>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-600">
                <p>
                  {t('customer.finalPricingNote')}
                </p>
              </div>

              {/* Payment Method Selection */}
              <div className="mt-4 border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('customer.paymentMethod')} *
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center space-x-2 p-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-900">💵 {t('customer.paymentCash')}</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit"
                      checked={paymentMethod === 'credit'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-900">💳 {t('customer.paymentCredit')}</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="checks"
                      checked={paymentMethod === 'checks'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-900">📝 {t('customer.paymentChecks')}</span>
                  </label>
                  <label className="flex items-start space-x-2 p-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="other"
                      checked={paymentMethod === 'other'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-sm text-gray-900 block mb-2">✏️ {t('customer.paymentOther')}</span>
                      {paymentMethod === 'other' && (
                        <input
                          type="text"
                          value={paymentOtherText}
                          onChange={(e) => setPaymentOtherText(e.target.value)}
                          placeholder={t('customer.paymentOtherPlaceholder')}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={submitting || !paymentMethod}
                className="w-full mt-6 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2"></div>
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 me-2" />
                    {t('customer.proceedToCheckout')}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
