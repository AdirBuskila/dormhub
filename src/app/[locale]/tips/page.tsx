import React from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getTips } from '@/lib/db/tips';
import { TipList } from '@/components/tips/TipList';
import { getOptionalUser } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'tips' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function TipsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const user = await getOptionalUser();

  // Get user profile ID if logged in
  let userProfileId: string | undefined;
  if (user) {
    const supabase = getSupabaseClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', user.id)
      .single();
    userProfileId = profile?.id;
  }

  // Parse filters from search params
  const tag = typeof search.tag === 'string' ? search.tag : undefined;

  // Fetch approved tips
  const { data: tips } = await getTips(
    { status: 'approved', tags: tag ? [tag] : undefined },
    50,
    0,
    userProfileId
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tips & Advice
          </h1>
          <p className="text-gray-600">
            Community wisdom for dorm life
          </p>
        </div>

        {user && (
          <Link
            href={`/${locale}/tips/submit`}
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Share a Tip
          </Link>
        )}
      </div>

      {/* Quick Links */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-8">
        <h2 className="font-semibold text-blue-900 mb-2">Looking for guides?</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${locale}/tips/guide`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"  />
            </svg>
            Freshman's Handbook
          </Link>
        </div>
      </div>

      {/* Common Tags Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href={`/${locale}/tips`}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            !tag
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Tips
        </Link>
        {['move-in', 'study', 'food', 'laundry', 'social', 'product'].map((t) => (
          <Link
            key={t}
            href={`/${locale}/tips?tag=${t}`}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tag === t
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            #{t}
          </Link>
        ))}
      </div>

      {/* Tips List */}
      <TipList tips={tips} />

      {/* Empty State handled in TipList */}
    </div>
  );
}

