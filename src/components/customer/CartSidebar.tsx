'use client';

import Image from 'next/image';
import { CartItem } from './NewOrderPage';
import { Package, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CartSidebarProps {
  items: CartItem[];
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onSubmit: () => void;
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
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.quantity * 0), 0); // Using 0 for MVP

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
              {items.map((item) => (
                <div key={item.product.id} className="flex items-start space-x-3 border-b border-gray-200 pb-4">
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

              {/* Submit Button */}
              <button
                onClick={onSubmit}
                disabled={submitting}
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
