import React from 'react';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { requireAuth } from '@/lib/auth';
import { NewListingForm } from '@/components/marketplace/NewListingForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'marketplace' });

  return {
    title: t('newListing'),
  };
}

export default async function NewListingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Require authentication
  try {
    await requireAuth();
  } catch {
    redirect(`/${locale}/sign-in?redirect=/${locale}/marketplace/new`);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create New Listing
        </h1>
        <p className="text-gray-600">
          Share what you want to sell, buy, swap, or give away
        </p>
      </div>

      {/* Form */}
      <NewListingForm locale={locale} />
    </div>
  );
}

