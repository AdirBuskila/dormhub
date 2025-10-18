import React from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getListings } from '@/lib/db/listings';
import { ListingGrid } from '@/components/marketplace/ListingGrid';
import { getOptionalUser } from '@/lib/auth';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'marketplace' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function MarketplacePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const user = await getOptionalUser();
  const t = await getTranslations({ locale, namespace: 'marketplace' });

  // Parse filters from search params
  const filters = {
    type: typeof search.type === 'string' ? search.type : undefined,
    category: typeof search.category === 'string' ? search.category : undefined,
    search: typeof search.search === 'string' ? search.search : undefined,
  };

  // Fetch listings
  const { data: listings } = await getListings(filters, 20, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        {user && (
          <Link
            href={`/${locale}/marketplace/new`}
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            {t('createListing')}
          </Link>
        )}
      </div>

      {/* Filters will be added here as client component */}
      {/* For now, simple category quick filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Link
          href={`/${locale}/marketplace`}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            !filters.type && !filters.category
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </Link>
        <Link
          href={`/${locale}/marketplace?type=sell`}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filters.type === 'sell'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          For Sale
        </Link>
        <Link
          href={`/${locale}/marketplace?type=buy`}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filters.type === 'buy'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Looking to Buy
        </Link>
        <Link
          href={`/${locale}/marketplace?type=giveaway`}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filters.type === 'giveaway'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Giveaway
        </Link>
      </div>

      {/* Listings Grid */}
      <ListingGrid listings={listings} locale={locale} />

      {/* Empty state handled in ListingGrid */}
    </div>
  );
}

