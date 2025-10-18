'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, Flame, Zap, Package, Clock, ShoppingCart, Check } from 'lucide-react';
import Image from 'next/image';
import { Deal } from '@/types/database';

interface DealModalProps {
  deal: Deal;
  onClose: () => void;
  onAddToCart: (deal: Deal, quantity: number, tierPrice: number, tierQty: number) => void;
}

export default function DealModal({ deal, onClose, onAddToCart }: DealModalProps) {
  const t = useTranslations();
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3>(1);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const tiers = [
    { tier: 1 as const, qty: deal.tier_1_qty, pricePerUnit: deal.tier_1_price },
    deal.tier_2_qty && deal.tier_2_price ? { tier: 2 as const, qty: deal.tier_2_qty, pricePerUnit: deal.tier_2_price } : null,
    deal.tier_3_qty && deal.tier_3_price ? { tier: 3 as const, qty: deal.tier_3_qty, pricePerUnit: deal.tier_3_price } : null,
  ].filter(Boolean) as Array<{ tier: 1 | 2 | 3; qty: number; pricePerUnit: number }>;

  const selectedTierData = tiers.find(t => t.tier === selectedTier)!;
  const totalUnits = selectedTierData.qty * quantity;
  const pricePerUnit = selectedTierData.pricePerUnit;
  const totalPrice = pricePerUnit * totalUnits;
  const savings = (deal.tier_1_price - pricePerUnit) * totalUnits;

  const remaining = deal.max_quantity ? deal.max_quantity - deal.sold_quantity : null;
  const isLowStock = remaining !== null && remaining <= 5;

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await onAddToCart(deal, quantity, selectedTierData.pricePerUnit, selectedTierData.qty);
      setAdded(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAdding(false);
    }
  };

  const getPriorityStyle = (priority: number) => {
    if (priority >= 15) return {
      gradient: 'from-red-500 via-pink-500 to-orange-500',
      badge: 'bg-red-500',
      icon: Flame,
    };
    if (priority >= 10) return {
      gradient: 'from-cyan-500 via-blue-500 to-purple-500',
      badge: 'bg-cyan-500',
      icon: Zap,
    };
    return {
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      badge: 'bg-emerald-500',
      icon: Package,
    };
  };

  const style = getPriorityStyle(deal.priority);
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header with gradient */}
        <div className={`relative bg-gradient-to-r ${style.gradient} p-6 text-white`}>
          <button
            onClick={onClose}
            className="absolute top-4 end-4 text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            <X className="h-5 w-5" />
          </button>

          {deal.priority >= 15 && (
            <div className="flex items-center gap-2 mb-3">
              <Flame className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-bold uppercase tracking-wider">{t('deals.hotDeal')}</span>
            </div>
          )}

          <h2 className="text-2xl font-bold mb-2 pe-8">{deal.title}</h2>
          {deal.description && (
            <p className="text-white/90 text-sm">{deal.description}</p>
          )}
        </div>

        <div className="p-6">
          {/* Product Info with Image */}
          {deal.product && (
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              {deal.product.image_url && (
                <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden ring-2 ring-gray-200">
                  <Image
                    src={deal.product.image_url}
                    alt={deal.product.model}
                    fill
                    className="object-contain p-2"
                    sizes="80px"
                  />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{deal.product.brand} {deal.product.model}</p>
                <p className="text-sm text-gray-600">{deal.product.storage}</p>
                {isLowStock && remaining !== null && (
                  <div className="flex items-center gap-1 text-orange-600 text-xs font-semibold mt-1">
                    <Package className="h-3 w-3" />
                    {t('deals.onlyLeft', { count: remaining })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tier Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              {t('customer.selectTier')}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {tiers.map((tier) => {
                const isSelected = selectedTier === tier.tier;
                const savingsPerUnit = tier.tier > 1 ? deal.tier_1_price - tier.pricePerUnit : 0;
                const totalSavingsForTier = savingsPerUnit * tier.qty;

                return (
                  <button
                    key={tier.tier}
                    onClick={() => setSelectedTier(tier.tier)}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all
                      ${isSelected 
                        ? 'border-indigo-500 bg-indigo-50 ring-4 ring-indigo-100' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -end-2 bg-indigo-500 text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}

                    <div className="text-center">
                      <div className="text-xs text-gray-600 font-medium mb-1">{tier.qty}x</div>
                      <div className={`text-lg font-bold ${isSelected ? 'text-indigo-600' : 'text-gray-900'}`}>
                        ₪{tier.pricePerUnit.toFixed(0)}
                      </div>
                      {tier.tier > 1 && (
                        <div className="text-[10px] text-green-600 font-semibold mt-1">
                          Save ₪{totalSavingsForTier.toFixed(0)}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              {t('customer.dealQuantity')}
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 font-bold text-xl transition"
                disabled={quantity <= 1}
              >
                −
              </button>
              <div className="flex-1 text-center">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-center text-2xl font-bold border-2 border-gray-300 rounded-lg py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  min="1"
                />
              </div>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 font-bold text-xl transition"
              >
                +
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-indigo-600" />
              <span className="font-semibold text-indigo-900">{t('customer.dealSummary')}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('customer.totalUnits')}:</span>
                <span className="font-bold text-gray-900">{totalUnits} {t('customer.units')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('customer.pricePerUnit')}:</span>
                <span className="font-bold text-gray-900">₪{pricePerUnit.toFixed(0)}</span>
              </div>
              <div className="border-t border-indigo-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">{t('customer.totalPrice')}:</span>
                  <span className="font-bold text-xl text-indigo-600">₪{totalPrice.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          {deal.payment_methods && deal.payment_methods.length > 0 && (
            <div className="mb-6 text-sm text-gray-600">
              <span className="font-medium">{t('deals.payment')}:</span>
              {' '}
              {deal.payment_methods.map(m => t(`deals.paymentMethod.${m}`)).join(', ')}
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={adding || added}
            className={`
              w-full py-4 rounded-xl font-bold text-white text-lg
              transform transition-all duration-300
              flex items-center justify-center gap-3
              ${added 
                ? 'bg-green-500' 
                : `bg-gradient-to-r ${style.gradient} hover:shadow-xl hover:scale-105`
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {added ? (
              <>
                <Check className="h-6 w-6" />
                {t('customer.addedToCart')}
              </>
            ) : adding ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                {t('common.loading')}
              </>
            ) : (
              <>
                <ShoppingCart className="h-6 w-6" />
                {t('customer.addDealToCart')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

