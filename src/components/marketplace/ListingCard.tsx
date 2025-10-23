'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { ListingWithOwner } from '@/types/database';

interface ListingCardProps {
  listing: ListingWithOwner;
  locale: string;
}

export function ListingCard({ listing, locale }: ListingCardProps) {
  const t = useTranslations('marketplace');

  const firstImage = listing.images[0] || '/images/products/placeholder.jpg';
  const typeColor = {
    sell: 'bg-blue-100 text-blue-800',
    buy: 'bg-green-100 text-green-800',
    swap: 'bg-purple-100 text-purple-800',
    giveaway: 'bg-orange-100 text-orange-800',
  }[listing.type];

  return (
    <Link
      href={`/${locale}/marketplace/${listing.id}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200"
    >
      {/* Image */}
      <div className="relative h-40 bg-gray-100">
        <Image
          src={firstImage}
          alt={listing.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="50vw"
        />
        {/* Type Badge */}
        <div className="absolute top-1.5 left-1.5">
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${typeColor}`}>
            {t(`type.${listing.type}`)}
          </span>
        </div>
        {/* Status Badge */}
        {listing.status !== 'active' && (
          <div className="absolute top-1.5 right-1.5">
            <span className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-white">
              {t(`status.${listing.status}`)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1.5">
          {listing.title}
        </h3>

        {/* Price */}
        {listing.price_ils !== null && listing.price_ils !== undefined && (
          <p className="text-lg font-bold text-gray-900 mb-1.5">
            ₪{listing.price_ils.toFixed(0)}
          </p>
        )}

        {/* Condition */}
        {listing.condition && (
          <p className="text-xs text-gray-500 mb-1.5">
            {t('condition')}: {t(`conditionValue.${listing.condition}`)}
          </p>
        )}

        {/* Owner */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600 border-t pt-1.5 mt-1.5">
          <span className="truncate">
            {listing.owner.username || listing.owner.full_name || t('anonymous')}
          </span>
        </div>

        {/* Tags */}
        {listing.tags && listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {listing.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {listing.tags.length > 2 && (
              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                +{listing.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

