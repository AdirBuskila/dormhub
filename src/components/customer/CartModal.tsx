'use client';

import Image from 'next/image';
import { CartItem } from './NewOrderPage';
import { Package, Minus, Plus, Trash2, ShoppingCart, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onSubmit: (paymentMethod: string, paymentOtherText?: string) => void;
  submitting: boolean;
}

export default function CartModal({
  isOpen,
  onClose,
  items,
  onQuantityChange,
  onRemove,
  onSubmit,
  submitting
}: CartModalProps) {
  const t = useTranslations();
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentOtherText, setPaymentOtherText] = useState<string>('');
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={submitting ? undefined : onClose}
      />

      {/* Loading Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-gray-50 z-[60] flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center max-w-sm mx-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('customer.processingOrder')}</h3>
            <p className="text-sm text-gray-600 text-center">{t('customer.pleaseWait')}</p>
          </div>
        </div>
      )}

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t('customer.shoppingCart')}
            </h2>
            <span className="text-sm text-gray-500">
              ({totalItems})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Cart Items - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-base font-medium text-gray-900">
                {t('customer.yourCartIsEmpty')}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {t('customer.addSomeProducts')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div 
                  key={`${item.product.id}-${item.isDeal ? item.dealInfo?.dealId : 'regular'}-${index}`} 
                  className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex items-start space-x-3">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {item.product.image_url ? (
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-gray-300">
                          <Image
                            src={item.product.image_url}
                            alt={`${item.product.brand} ${item.product.model}`}
                            fill
                            sizes="64px"
                            className="object-cover"
                            placeholder="blur"
                            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2UwZTBlMCIvPjwvc3ZnPg=="
                          />
                        </div>
                      ) : null}
                      <div 
                        className={`h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center ${item.product.image_url ? 'hidden' : 'flex'}`}
                      >
                        <Package className="h-8 w-8 text-gray-500" />
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {item.product.brand} {item.product.model}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {item.product.storage} • {item.product.condition}
                      </p>
                      {item.isDeal && item.dealInfo && (
                        <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 border border-orange-300">
                          🔥 {t('deals.hotDeal')} • {item.dealInfo.tierQty}x @ ₪{item.dealInfo.tierPrice.toFixed(0)}
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => onRemove(item.product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-600 font-medium">
                      {t('customer.quantity')}:
                    </span>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => onQuantityChange(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center text-base font-semibold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onQuantityChange(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= (item.product.total_stock - item.product.reserved_stock)}
                        className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Order Summary & Submit */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            {/* Summary */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  {t('customer.totalItems')}:
                </span>
                <span className="text-base font-semibold text-gray-900">
                  {totalItems}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {t('customer.finalPricingNote')}
              </p>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {t('customer.paymentMethod')} *
              </label>
              <div className="space-y-1.5">
                <label className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg hover:bg-white cursor-pointer transition-colors">
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
                <label className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg hover:bg-white cursor-pointer transition-colors">
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
                <label className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg hover:bg-white cursor-pointer transition-colors">
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
                <label className="flex items-start space-x-2 p-2 border border-gray-300 rounded-lg hover:bg-white cursor-pointer transition-colors">
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
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white me-2"></div>
                  {t('common.submitting')}
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 me-2" />
                  {t('customer.completeOrder')}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Custom CSS for slide-up animation */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

