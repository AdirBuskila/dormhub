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
      className="group block bg-white rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-200"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        <Image
          src={firstImage}
          alt={listing.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Type Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColor}`}>
            {t(`type.${listing.type}`)}
          </span>
        </div>
        {/* Status Badge */}
        {listing.status !== 'active' && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-800 text-white">
              {t(`status.${listing.status}`)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-2">
          {listing.title}
        </h3>

        {listing.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {listing.description}
          </p>
        )}

        {/* Price */}
        {listing.price_ils !== null && listing.price_ils !== undefined && (
          <p className="text-xl font-bold text-gray-900 mb-2">
            ₪{listing.price_ils.toFixed(0)}
          </p>
        )}

        {/* Condition */}
        {listing.condition && (
          <p className="text-sm text-gray-500 mb-2">
            {t('condition')}: {t(`conditionValue.${listing.condition}`)}
          </p>
        )}

        {/* Owner */}
        <div className="flex items-center gap-2 text-sm text-gray-600 border-t pt-2 mt-2">
          <span className="truncate">
            {listing.owner.username || listing.owner.full_name || t('anonymous')}
          </span>
          {listing.owner.room && (
            <span className="text-gray-400">• {listing.owner.room}</span>
          )}
        </div>

        {/* Tags */}
        {listing.tags && listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {listing.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {listing.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                +{listing.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

