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

interface StudentDiscount {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  discount_type: string;
  discount_value: string;
  terms: string | null;
  valid_days: DayOfWeek[] | null;
  valid_from: string | null;
  valid_until: string | null;
  requires_student_id: boolean;
  is_active: boolean;
}

interface Business {
  id: string;
  name: string;
  category: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  website: string | null;
  whatsapp: string | null;
  is_active: boolean;
  display_order: number;
  business_hours: BusinessHours[];
  student_discounts: StudentDiscount[];
}

const daysOrder: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function formatTime(time: string | null): string {
  if (!time) return '';
  // time is in format "HH:MM:SS", convert to "HH:MM"
  return time.substring(0, 5);
}

function BusinessCard({ business, index = 0 }: { business: Business; index?: number }) {
  const t = useTranslations('businesses');
  
  // Sort hours by day of week
  const sortedHours = [...business.business_hours].sort((a, b) => {
    return daysOrder.indexOf(a.day_of_week) - daysOrder.indexOf(b.day_of_week);
  });

  // Get current day to highlight it
  const currentDay = daysOrder[new Date().getDay()];
  
  // Check if business is currently open
  const isCurrentlyOpen = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const todayHours = sortedHours.find(h => h.day_of_week === currentDay);
    
    if (!todayHours || todayHours.is_closed || !todayHours.opens_at || !todayHours.closes_at) {
      return false;
    }
    
    return currentTime >= todayHours.opens_at.substring(0, 5) && currentTime <= todayHours.closes_at.substring(0, 5);
  };
  
  const isOpen = isCurrentlyOpen();

  return (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Header with category badge */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {business.logo_url && (
              <div className="flex-shrink-0">
                <img
                  src={business.logo_url}
                  alt={`${business.name} logo`}
                  className="w-16 h-16 rounded-lg bg-white object-cover shadow-lg"
                />
              </div>
            )}
            <div>
              <h3 className="text-2xl font-bold mb-2">{business.name}</h3>
              <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                {t(`category.${business.category}`)}
              </span>
            </div>
          </div>
          {business.student_discounts.length > 0 && (
            <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 flex-shrink-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {t('studentDiscounts')}
            </div>
          )}
        </div>
        {business.description && (
          <p className="mt-3 text-blue-50">{business.description}</p>
        )}
      </div>

      <div className="p-6">
        {/* Opening Hours */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('openingHours')}
          </h4>
          <div className="space-y-2">
            {sortedHours.map((hours) => {
              const isToday = hours.day_of_week === currentDay;
              const isTodayOpen = isToday && isOpen;
              
              return (
                <div 
                  key={hours.id}
                  className={`py-2 px-3 rounded ${
                    isToday ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                        {t(`days.${hours.day_of_week}`)}
                      </span>
                      {isTodayOpen && (
                        <div className="relative flex items-center">
                          <span className="flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-lg shadow-green-500/50"></span>
                          </span>
                        </div>
                      )}
                    </div>
                    {hours.is_closed || !hours.opens_at ? (
                      <span className="text-red-600 font-medium">{t('closed')}</span>
                    ) : (
                      <span className="text-gray-600">
                        {formatTime(hours.opens_at)} - {formatTime(hours.closes_at)}
                      </span>
                    )}
                  </div>
                  {hours.notes && (
                    <div className="mt-1 text-xs text-gray-500 italic pl-0">
                      {hours.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Student Discounts */}
        {business.student_discounts.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {t('studentDiscounts')}
            </h4>
            <div className="space-y-3">
              {business.student_discounts.map((discount) => (
                <div key={discount.id} className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 mb-1">{discount.title}</h5>
                      {discount.description && (
                        <p className="text-sm text-gray-700 mb-2">{discount.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="inline-block bg-yellow-200 text-yellow-900 px-2 py-1 rounded text-xs font-medium">
                          {discount.discount_value}
                        </span>
                        {discount.requires_student_id && (
                          <span className="text-xs text-gray-600 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                            </svg>
                            {t('requiresStudentId')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            {t('contactInfo')}
          </h4>
          <div className="space-y-2">
            {business.address && (
              <div className="flex items-center gap-2 text-gray-700">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">{business.address}</span>
              </div>
            )}
            {business.phone && (
              <div className="flex items-center gap-2 text-gray-700">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${business.phone}`} className="text-sm hover:text-green-600 transition-colors">{business.phone}</a>
              </div>
            )}
            {business.whatsapp && (
              <div className="flex items-center gap-2 text-gray-700">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <a 
                  href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm hover:text-green-600"
                >
                  {t('whatsapp')}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BusinessesPage() {
  const t = useTranslations('businesses');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBusinesses() {
      try {
        const response = await fetch('/api/businesses');
        if (!response.ok) throw new Error('Failed to fetch businesses');
        const data = await response.json();
        setBusinesses(data.businesses || []);
      } catch (err) {
        console.error('Error fetching businesses:', err);
        setError('Failed to load businesses');
      } finally {
        setLoading(false);
      }
    }

    fetchBusinesses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t('title')}
              </h1>
              <p className="text-xl text-blue-100 mb-2">
                {t('subtitle')}
              </p>
              <p className="text-blue-200">
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
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('title')}
            </h1>
            <p className="text-xl text-blue-100 mb-2">
              {t('subtitle')}
            </p>
            <p className="text-blue-200">
              {t('description')}
            </p>
          </div>
        </div>
      </div>

      {/* Businesses Grid */}
      <div className="container mx-auto px-4 py-12">
        {businesses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No businesses found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {businesses.map((business, index) => (
              <BusinessCard key={business.id} business={business} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Smart Buying Section */}
      {businesses.some(b => b.student_discounts.length > 0) && (
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
                  <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {t('smartBuying')}
                </h2>
                <p className="text-gray-700">{t('smartBuyingDescription')}</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="space-y-6">
                  {businesses
                    .filter(b => b.student_discounts.length > 0)
                    .map((business) => (
                      <div key={business.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{business.name}</h3>
                        <div className="space-y-3">
                          {business.student_discounts.map((discount) => (
                            <div key={discount.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 bg-yellow-400 text-yellow-900 w-12 h-12 rounded-full flex items-center justify-center font-bold">
                                  {discount.discount_value.includes('%') ? discount.discount_value : '★'}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{discount.title}</h4>
                                  {discount.description && (
                                    <p className="text-sm text-gray-600 mt-1">{discount.description}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



