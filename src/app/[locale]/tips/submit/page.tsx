import React from 'react';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { requireAuth } from '@/lib/auth';
import { SubmitTipForm } from '@/components/tips/SubmitTipForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'tips' });

  return {
    title: t('submitTip'),
  };
}

export default async function SubmitTipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Require authentication
  try {
    await requireAuth();
  } catch {
    redirect(`/${locale}/sign-in?redirect=/${locale}/tips/submit`);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Share Your Tip
        </h1>
        <p className="text-gray-600">
          Help fellow dorm residents with your experience and knowledge
        </p>
      </div>

      {/* Form */}
      <SubmitTipForm locale={locale} />
    </div>
  );
}

