'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Flame, Sparkles, Clock, Package, Zap, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Deal } from '@/types/database';

interface DealsCarouselProps {
  onDealClick: (deal: Deal) => void;
}

export default function DealsCarousel({ onDealClick }: DealsCarouselProps) {
  const t = useTranslations();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/deals');
      const data = await response.json();
      // Filter active deals and sort by priority
      const activeDeals = (data.deals || [])
        .filter((deal: Deal) => deal.is_active)
        .sort((a: Deal, b: Deal) => b.priority - a.priority)
        .slice(0, 5); // Show top 5 deals
      setDeals(activeDeals);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityStyle = (priority: number) => {
    if (priority >= 15) return {
      gradient: 'from-red-500 via-pink-500 to-orange-500',
      glow: 'shadow-red-500/30',
      badge: 'bg-red-500',
      icon: Flame,
      label: t('deals.hotDeal'),
      ringColor: 'ring-red-500/50'
    };
    if (priority >= 10) return {
      gradient: 'from-cyan-500 via-blue-500 to-purple-500',
      glow: 'shadow-cyan-500/30',
      badge: 'bg-cyan-500',
      icon: Sparkles,
      label: 'Top Deal',
      ringColor: 'ring-cyan-500/50'
    };
    return {
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      glow: 'shadow-emerald-500/30',
      badge: 'bg-emerald-500',
      icon: Sparkles,
      label: 'Special Offer',
      ringColor: 'ring-emerald-500/50'
    };
  };

  const getTimeLeft = (deal: Deal) => {
    if (!deal.expires_at || (deal.expiration_type !== 'date' && deal.expiration_type !== 'both')) {
      return null;
    }

    const now = new Date();
    const expires = new Date(deal.expires_at);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return t('deals.expired');

    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const getRemaining = (deal: Deal) => {
    if (!deal.max_quantity || (deal.expiration_type !== 'quantity' && deal.expiration_type !== 'both')) {
      return null;
    }
    return deal.max_quantity - deal.sold_quantity;
  };

  if (loading) {
    return (
      <div className="mb-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="flex gap-4 overflow-x-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-80 h-48 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <Flame className="h-7 w-7 text-orange-500 animate-pulse" />
          <div className="absolute inset-0 animate-ping">
            <Flame className="h-7 w-7 text-orange-500 opacity-50" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {t('deals.activeDeals')}
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </h2>
          <p className="text-sm text-gray-600">{t('customer.dealsSubtitle')}</p>
        </div>
      </div>

      {/* Horizontal Scrolling Deals */}
      <div className="relative -mx-4 px-4">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {deals.map((deal) => {
            const style = getPriorityStyle(deal.priority);
            const Icon = style.icon;
            const timeLeft = getTimeLeft(deal);
            const remaining = getRemaining(deal);
            const isUrgent = remaining !== null && remaining <= 3;

            return (
              <div
                key={deal.id}
                onClick={() => onDealClick(deal)}
                className="flex-shrink-0 w-80 snap-start cursor-pointer group"
              >
                <div
                  className={`
                    relative h-full bg-white rounded-xl shadow-lg hover:shadow-2xl 
                    transform transition-all duration-300 hover:scale-105 hover:-translate-y-1
                    border-2 border-transparent hover:border-opacity-50
                    overflow-hidden ${style.glow}
                  `}
                >
                  {/* Animated gradient border */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${style.gradient} opacity-0 group-hover:opacity-10 transition-opacity rounded-xl`} />
                  
                  {/* Top gradient bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${style.gradient}`} />

                  {/* Low Stock Badge */}
                  {isUrgent && remaining !== null && (
                    <div className="absolute top-3 start-3 z-10">
                      <div className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                        <Package className="h-3.5 w-3.5" />
                        {remaining} {t('deals.left')}!
                      </div>
                    </div>
                  )}

                  <div className="p-5">
                    {/* Product Image & Title */}
                    <div className="flex items-start gap-3 mb-4">
                      {deal.product?.image_url && (
                        <div className="relative w-16 h-16 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden ring-2 ring-gray-200">
                          <Image
                            src={deal.product.image_url}
                            alt={deal.title}
                            fill
                            className="object-contain p-1"
                            sizes="64px"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2 mb-1">
                          {deal.title}
                        </h3>
                        {deal.description && (
                          <p className="text-xs text-gray-600 line-clamp-1">
                            {deal.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Pricing Tiers - Compact */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Zap className="h-3.5 w-3.5 text-indigo-600" />
                        <span className="text-xs font-semibold text-indigo-900">{t('deals.tieredPricing')}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white rounded-lg p-2 text-center shadow-sm">
                          <div className="text-[10px] text-gray-600 font-medium">{deal.tier_1_qty}x</div>
                          <div className="text-base font-bold text-indigo-600">₪{deal.tier_1_price.toFixed(0)}</div>
                        </div>
                        {deal.tier_2_qty && deal.tier_2_price && (
                          <div className="bg-white rounded-lg p-2 text-center ring-2 ring-indigo-400 shadow-sm">
                            <div className="text-[10px] text-gray-600 font-medium">{deal.tier_2_qty}x</div>
                            <div className="text-base font-bold text-indigo-600">₪{deal.tier_2_price.toFixed(0)}</div>
                            <div className="text-[9px] text-green-600 font-semibold">
                              -₪{(deal.tier_1_price - deal.tier_2_price).toFixed(0)}
                            </div>
                          </div>
                        )}
                        {deal.tier_3_qty && deal.tier_3_price && (
                          <div className="bg-white rounded-lg p-2 text-center ring-2 ring-green-400 shadow-sm">
                            <div className="text-[10px] text-gray-600 font-medium">{deal.tier_3_qty}x</div>
                            <div className="text-base font-bold text-green-600">₪{deal.tier_3_price.toFixed(0)}</div>
                            <div className="text-[9px] text-green-600 font-semibold">
                              -₪{(deal.tier_1_price - deal.tier_3_price).toFixed(0)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timer & Stats */}
                    <div className="flex items-center justify-between text-xs mb-3">
                      {timeLeft && (
                        <div className="flex items-center gap-1.5 text-orange-600 font-semibold">
                          <Clock className="h-3.5 w-3.5 animate-pulse" />
                          <span>{timeLeft}</span>
                        </div>
                      )}
                      
                      {remaining !== null && !isUrgent && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Package className="h-3.5 w-3.5" />
                          <span>{remaining} {t('deals.left')}</span>
                        </div>
                      )}

                      {deal.payment_methods && deal.payment_methods.length > 0 && (
                        <div className="text-[10px] text-gray-500">
                          {deal.payment_methods.map(m => t(`deals.paymentMethod.${m}`)).join(', ')}
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <button
                      className={`
                        w-full py-2.5 rounded-lg font-bold text-white text-sm
                        bg-gradient-to-r ${style.gradient}
                        hover:shadow-lg transform hover:scale-105 transition-all
                        flex items-center justify-center gap-2
                        group-hover:gap-3
                      `}
                    >
                      <Icon className="h-4 w-4" />
                      {t('deals.grabDeal')}
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll indicator on mobile */}
      <div className="flex justify-center gap-1 mt-2 md:hidden">
        {deals.map((_, idx) => (
          <div key={idx} className="h-1 w-8 bg-gray-300 rounded-full" />
        ))}
      </div>
    </div>
  );
}

