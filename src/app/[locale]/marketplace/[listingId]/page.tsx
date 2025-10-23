import React from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getListingWithOwner } from '@/lib/db/listings';
import { getOptionalUser } from '@/lib/auth';
import { ListingActions } from '@/components/marketplace/ListingActions';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; listingId: string }>;
}) {
  const { locale, listingId } = await params;
  const listing = await getListingWithOwner(listingId);

  if (!listing) {
    return {
      title: 'Listing Not Found',
    };
  }

  return {
    title: listing.title,
    description: listing.description || listing.title,
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; listingId: string }>;
}) {
  const { locale, listingId } = await params;
  const listing = await getListingWithOwner(listingId);
  const user = await getOptionalUser();

  if (!listing) {
    notFound();
  }

  const isOwner = user?.profileId === listing.owner_id;

  const typeColor = {
    sell: 'bg-blue-100 text-blue-800',
    buy: 'bg-green-100 text-green-800',
    swap: 'bg-purple-100 text-purple-800',
    giveaway: 'bg-orange-100 text-orange-800',
  }[listing.type];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href={`/${locale}/marketplace`}
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          {listing.images && listing.images.length > 0 ? (
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={listing.images[0]}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {listing.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {listing.images.slice(1, 5).map((img, idx) => (
                    <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={img}
                        alt={`${listing.title} ${idx + 2}`}
                        fill
                        className="object-cover"
                        sizes="25vw"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="relative aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">No images</p>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {/* Type Badge */}
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${typeColor} mb-4`}>
            {listing.type.charAt(0).toUpperCase() + listing.type.slice(1)}
          </span>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {listing.title}
          </h1>

          {/* Price */}
          {listing.price_ils !== null && listing.price_ils !== undefined && (
            <p className="text-3xl font-bold text-blue-600 mb-6">
              ₪{listing.price_ils.toFixed(0)}
            </p>
          )}

          {/* Description */}
          {listing.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            {listing.condition && (
              <div className="flex justify-between">
                <span className="text-gray-600">Condition:</span>
                <span className="font-medium text-gray-900">
                  {listing.condition.replace('_', ' ').charAt(0).toUpperCase() + listing.condition.slice(1)}
                </span>
              </div>
            )}
            {listing.category && (
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium text-gray-900">{listing.category}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Posted:</span>
              <span className="font-medium text-gray-900">
                {new Date(listing.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Owner */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Listed by</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-semibold">
                  {(listing.owner.username || listing.owner.full_name || 'U')[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {listing.owner.username || listing.owner.full_name || 'Anonymous'}
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {listing.tags && listing.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {listing.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <ListingActions
            isOwner={isOwner}
            user={user}
            listingId={listingId}
            locale={locale}
            listingType={listing.type}
            listingTitle={listing.title}
            ownerPhone={listing.owner.phone}
          />
        </div>
      </div>
    </div>
  );
}

