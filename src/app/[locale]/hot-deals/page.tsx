'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import SkeletonLoader from '@/components/SkeletonLoader';

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface BusinessHours {
  id: string;
  business_id: string;
  day_of_week: DayOfWeek;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
  notes: string | null;
}

interface Business {
  id: string;
  name: string;
  category: string;
  logo_url: string | null;
  phone: string | null;
  address: string | null;
  whatsapp: string | null;
  business_hours: BusinessHours[];
}

interface HotDeal {
  id: string;
  business_id: string;
  title: string;
  description: string;
  image_url: string | null;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
  business: Business;
}

export default function HotDealsPage() {
  const t = useTranslations('hotDeals');
  const [hotDeals, setHotDeals] = useState<HotDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHotDeals() {
      try {
        const response = await fetch('/api/hot-deals');
        if (!response.ok) throw new Error('Failed to fetch hot deals');
        const data = await response.json();
        setHotDeals(data.hotDeals || []);
      } catch (err) {
        console.error('Error fetching hot deals:', err);
        setError('Failed to load hot deals');
      } finally {
        setLoading(false);
      }
    }

    fetchHotDeals();
  }, []);

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpiringSoon = (date: string | null) => {
    if (!date) return false;
    const expiryDate = new Date(date);
    const now = new Date();
    const hoursDiff = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 0 && hoursDiff <= 24;
  };

  const isBusinessOpen = (businessHours: BusinessHours[]) => {
    if (!businessHours || businessHours.length === 0) return null; // Unknown status
    
    const now = new Date();
    const daysOrder: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = daysOrder[now.getDay()];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    const todayHours = businessHours.find(h => h.day_of_week === currentDay);
    
    if (!todayHours || todayHours.is_closed || !todayHours.opens_at || !todayHours.closes_at) {
      return false;
    }
    
    // Convert opening and closing times to minutes since midnight
    const [openHour, openMinute] = todayHours.opens_at.substring(0, 5).split(':').map(Number);
    const [closeHour, closeMinute] = todayHours.closes_at.substring(0, 5).split(':').map(Number);
    const openTimeInMinutes = openHour * 60 + openMinute;
    const closeTimeInMinutes = closeHour * 60 + closeMinute;
    
    // Handle closing time past midnight (e.g., 00:00)
    if (closeTimeInMinutes < openTimeInMinutes) {
      // Business closes after midnight
      return currentTimeInMinutes >= openTimeInMinutes || currentTimeInMinutes <= closeTimeInMinutes;
    }
    
    // Normal case: business closes on the same day
    return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes <= closeTimeInMinutes;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-orange-500 via-red-500 to-red-600 text-white py-16 shadow-xl">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-6xl animate-bounce">🔥</span>
                <h1 className="text-4xl md:text-5xl font-bold">
                  {t('title')}
                </h1>
                <span className="text-6xl animate-bounce animation-delay-150">🔥</span>
              </div>
              <p className="text-xl text-orange-100 mb-2">
                {t('subtitle')}
              </p>
              <p className="text-orange-200">
                {t('description')}
              </p>
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        <div className="container mx-auto px-4 py-12">
          <SkeletonLoader type="business" count={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-red-600 text-white py-16 shadow-xl">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-6xl animate-bounce">🔥</span>
              <h1 className="text-4xl md:text-5xl font-bold">
                {t('title')}
              </h1>
              <span className="text-6xl animate-bounce animation-delay-150">🔥</span>
            </div>
            <p className="text-xl text-orange-100 mb-2">
              {t('subtitle')}
            </p>
            <p className="text-orange-200">
              {t('description')}
            </p>
            {hotDeals.length > 0 && (
              <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
                <span className="font-semibold">{hotDeals.length} Active Deal{hotDeals.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hot Deals Grid */}
      <div className="container mx-auto px-4 py-12">
        {hotDeals.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🎯</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('noDeals')}</h2>
            <p className="text-gray-600">{t('checkBackSoon')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
            {hotDeals.map((deal, index) => (
              <div 
                key={deal.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Deal Image */}
                {deal.image_url ? (
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={deal.image_url}
                      alt={deal.title}
                      className="w-full h-full object-cover"
                    />
                    {isExpiringSoon(deal.valid_until) && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
                        ⏰ Soon!
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <span>🔥</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-40 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                    <span className="text-6xl">🔥</span>
                    {isExpiringSoon(deal.valid_until) && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
                        ⏰ Soon!
                      </div>
                    )}
                  </div>
                )}

                {/* Deal Content */}
                <div className="p-4">
                  {/* Business Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="relative">
                      {deal.business.logo_url ? (
                        <img
                          src={deal.business.logo_url}
                          alt={deal.business.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                          {deal.business.name.charAt(0)}
                        </div>
                      )}
                      {/* Open/Closed Indicator */}
                      {isBusinessOpen(deal.business.business_hours) !== null && (
                        <div 
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            isBusinessOpen(deal.business.business_hours) ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          title={isBusinessOpen(deal.business.business_hours) ? 'Open' : 'Closed'}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{deal.business.name}</h3>
                      <span className="text-xs text-gray-500">{t(`category.${deal.business.category}`)}</span>
                    </div>
                  </div>

                  {/* Deal Title & Description */}
                  <h2 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">{deal.title}</h2>
                  <p className="text-sm text-gray-600 mb-3 whitespace-pre-line line-clamp-2">{deal.description}</p>

                  {/* Valid Until */}
                  {deal.valid_until && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="truncate">{formatDate(deal.valid_until)}</span>
                    </div>
                  )}

                  {/* WhatsApp Button */}
                  {deal.business.whatsapp && (
                    <a
                      href={`https://wa.me/${deal.business.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#25D366] text-white px-3 py-2 rounded-lg hover:bg-[#20BA5A] transition-colors text-center text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      {hotDeals.length > 0 && (
        <div className="bg-white py-12 border-t border-gray-200">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('businessOwner')}</h2>
            <p className="text-gray-600 mb-6">{t('businessOwnerCTA')}</p>
            <a
              href="https://wa.me/972546093624?text=%D7%94%D7%99%D7%99%20%D7%90%D7%A0%D7%99%20%D7%91%D7%A2%D7%9C%20%D7%A2%D7%A1%D7%A7%20%D7%95%D7%A8%D7%95%D7%A6%D7%94%20%D7%9C%D7%A4%D7%A8%D7%A1%D7%9D%20%D7%91%D7%9E%D7%91%D7%A6%D7%A2%D7%99%D7%9D%20%D7%97%D7%9E%D7%99%D7%9D"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {t('createDeal')}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

