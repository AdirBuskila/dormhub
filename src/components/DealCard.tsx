'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Flame, Clock, Zap, Package, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Deal } from '@/types/database';

interface DealCardProps {
  deal: Deal;
  onClick?: () => void;
}

export default function DealCard({ deal, onClick }: DealCardProps) {
  const t = useTranslations();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!deal.expires_at || (deal.expiration_type !== 'date' && deal.expiration_type !== 'both')) {
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const expires = new Date(deal.expires_at!);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft(t('deals.expired'));
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      // Mark as urgent if less than 24 hours
      setIsUrgent(diff < 24 * 60 * 60 * 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [deal.expires_at, deal.expiration_type, t]);

  const getPriorityStyle = (priority: number) => {
    if (priority >= 15) return {
      gradient: 'from-red-500 via-pink-500 to-orange-500',
      borderGradient: 'border-gradient-hot',
      glow: 'shadow-red-500/50',
      badge: 'bg-red-500',
      icon: Flame,
      pulse: true
    };
    if (priority >= 10) return {
      gradient: 'from-cyan-500 via-blue-500 to-purple-500',
      borderGradient: 'border-gradient-cool',
      glow: 'shadow-cyan-500/50',
      badge: 'bg-cyan-500',
      icon: TrendingUp,
      pulse: false
    };
    return {
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      borderGradient: 'border-gradient-mint',
      glow: 'shadow-emerald-500/50',
      badge: 'bg-emerald-500',
      icon: Sparkles,
      pulse: false
    };
  };

  const style = getPriorityStyle(deal.priority);
  const Icon = style.icon;

  const remaining = deal.max_quantity ? deal.max_quantity - deal.sold_quantity : null;
  const isLowStock = remaining !== null && remaining <= 3 && remaining > 0;

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl cursor-pointer
        transform transition-all duration-300 hover:scale-105
        bg-white shadow-lg hover:shadow-2xl ${style.glow}
        ${style.pulse ? 'animate-pulse-subtle' : ''}
        mx-3 sm:mx-0
      `}
    >
      {/* Animated Gradient Border */}
      <div className={`h-1 bg-gradient-to-r ${style.gradient} ${style.borderGradient}`} />

      {/* Hot Deal Badge */}
      {deal.priority >= 15 && (
        <div className="absolute top-4 end-4 z-10">
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-bounce-subtle">
            <Flame className="h-3 w-3" />
            {t('deals.hotDeal')}
          </div>
        </div>
      )}

      {/* Limited Stock Badge */}
      {isLowStock && (
        <div className="absolute top-4 start-4 z-10">
          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <AlertCircle className="h-3 w-3" />
            {t('deals.onlyLeft', { count: remaining })}
          </div>
        </div>
      )}

      <div className="p-5">
        {/* Product Image & Info */}
        <div className="flex items-start gap-4 mb-4">
          {deal.product?.image_url && (
            <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={deal.product.image_url}
                alt={deal.title}
                fill
                className="object-contain"
                sizes="80px"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
              {deal.title}
            </h3>
            {deal.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {deal.description}
              </p>
            )}
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">{t('deals.tieredPricing')}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-lg p-2 text-center">
              <div className="text-xs text-gray-600">{deal.tier_1_qty}x</div>
              <div className="text-lg font-bold text-indigo-600">₪{deal.tier_1_price.toFixed(0)}</div>
            </div>
            {deal.tier_2_qty && deal.tier_2_price && (
              <div className="bg-white rounded-lg p-2 text-center ring-2 ring-indigo-400">
                <div className="text-xs text-gray-600">{deal.tier_2_qty}x</div>
                <div className="text-lg font-bold text-indigo-600">₪{deal.tier_2_price.toFixed(0)}</div>
                <div className="text-xs text-green-600 font-medium">
                  Save ₪{(deal.tier_1_price * deal.tier_2_qty - deal.tier_2_price * deal.tier_2_qty).toFixed(0)}
                </div>
              </div>
            )}
            {deal.tier_3_qty && deal.tier_3_price && (
              <div className="bg-white rounded-lg p-2 text-center ring-2 ring-green-400">
                <div className="text-xs text-gray-600">{deal.tier_3_qty}x</div>
                <div className="text-lg font-bold text-green-600">₪{deal.tier_3_price.toFixed(0)}</div>
                <div className="text-xs text-green-600 font-medium">
                  Save ₪{(deal.tier_1_price * deal.tier_3_qty - deal.tier_3_price * deal.tier_3_qty).toFixed(0)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timer & Stats */}
        <div className="flex items-center justify-between text-sm">
          {timeLeft && (
            <div className={`flex items-center gap-2 ${isUrgent ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
              <Clock className={`h-4 w-4 ${isUrgent ? 'animate-pulse' : ''}`} />
              <span>{timeLeft}</span>
            </div>
          )}
          
          {remaining !== null && (
            <div className="flex items-center gap-2 text-gray-600">
              <Package className="h-4 w-4" />
              <span>{remaining} {t('deals.left')}</span>
            </div>
          )}

          {!timeLeft && remaining === null && deal.expiration_type === 'none' && (
            <div className="text-green-600 font-medium">
              {t('deals.noExpiration')}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        {deal.payment_methods && deal.payment_methods.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              {t('deals.paymentMethods')}: {deal.payment_methods.map(m => t(`deals.payment.${m}`)).join(', ')}
            </div>
            {deal.payment_notes && (
              <div className="text-xs text-gray-500 mt-1">{deal.payment_notes}</div>
            )}
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={onClick}
          className={`
            w-full mt-4 py-3 rounded-lg font-bold text-white
            bg-gradient-to-r ${style.gradient}
            hover:shadow-lg transform hover:scale-105 transition-all
            flex items-center justify-center gap-2
          `}
        >
          <Icon className="h-5 w-5" />
          {t('deals.grabDeal')}
        </button>
      </div>
    </div>
  );
}

