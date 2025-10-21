'use client';

import React from 'react';
import type { ListingWithOwner } from '@/types/database';
import { ListingCard } from './ListingCard';

interface ListingGridProps {
  listings: ListingWithOwner[];
  locale: string;
}

export function ListingGrid({ listings, locale }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No listings found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing, index) => (
        <div
          key={listing.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ListingCard listing={listing} locale={locale} />
        </div>
      ))}
    </div>
  );
}

