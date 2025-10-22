import React from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'guide' });

  return {
    title: t('title'),
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'guide' });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href={`/${locale}/tips`}
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('backToTips')}
      </Link>

      {/* Content */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {t('heading')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        <div className="prose prose-blue max-w-none">
          {/* Must-Have Apps Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">📱</span>
              {t('apps.title')}
            </h2>

            {/* Visitt+ */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 mb-6 border border-blue-200">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">🧰</span>
                {t('apps.visitt.name')}
              </h3>
              <p className="text-gray-700 mb-3">{t('apps.visitt.description')}</p>
              <p className="text-gray-600 text-sm mb-4">{t('apps.visitt.examples')}</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://apps.apple.com/il/app/visitt-tenant-app/id1585681810?l=he"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-black border-2 border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 384 512" fill="currentColor">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                  </svg>
                  iPhone
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=io.visitt.portal&hl=he&pli=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 512 512" fill="currentColor">
                    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                  </svg>
                  Android
                </a>
              </div>
            </div>

            {/* Cashless Laundry */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 mb-6 border border-purple-200">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">🧺</span>
                {t('apps.laundry.name')}
              </h3>
              <p className="text-gray-700 mb-4">{t('apps.laundry.description')}</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://apps.apple.com/us/app/cashless-laundry/id1385395416"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 384 512" fill="currentColor">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                  </svg>
                  iPhone
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.ionicframework.whbalancingapp936250&hl=he"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 512 512" fill="currentColor">
                    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                  </svg>
                  Android
                </a>
              </div>
            </div>

            {/* LG ThinQ */}
            <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl p-6 mb-6 border border-cyan-200">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">❄️</span>
                {t('apps.lgthinq.name')}
              </h3>
              <p className="text-gray-700 mb-4">{t('apps.lgthinq.description')}</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://apps.apple.com/us/app/lg-thinq/id993504342"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 384 512" fill="currentColor">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                  </svg>
                  iPhone
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.lgeha.nuts&hl=he"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 512 512" fill="currentColor">
                    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                  </svg>
                  Android
                </a>
              </div>
            </div>
          </div>

          {/* Dorm Lounge Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">☕</span>
              {t('lounge.title')}
            </h2>
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
              <p className="text-gray-700 mb-4">{t('lounge.description')}</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span>🪑</span>
                  <span>{t('lounge.point1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>💧</span>
                  <span>{t('lounge.point2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🤫</span>
                  <span>{t('lounge.point3')}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Friday Night Dinners Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">✡️</span>
              {t('shabbat.title')}
            </h2>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
              <p className="text-gray-700 mb-4">{t('shabbat.description')}</p>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li className="flex items-start gap-2">
                  <span>🍲</span>
                  <span>{t('shabbat.point1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>👨‍🏫</span>
                  <span>{t('shabbat.point2')}</span>
                </li>
              </ul>
              <p className="text-gray-700">
                <span className="font-semibold">📞</span> {t('shabbat.contact1')}{' '}
                <a
                  href="https://wa.me/972507703670"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 font-semibold underline"
                >
                  {t('shabbat.shmuel')}
                </a>
                {' '}{t('shabbat.contact2')}
              </p>
            </div>
          </div>

          {/* Community Note Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">💬</span>
              {t('community.title')}
            </h2>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <p className="text-gray-700 text-lg">
                {t('community.message')}
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-blue-600 text-white rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-3 flex items-center justify-center gap-2">
              <span className="text-3xl">💡</span>
              {t('cta.title')}
            </h3>
            <p className="text-blue-100 mb-6 text-lg">
              {t('cta.description')}
            </p>
            <Link
              href={`/${locale}/tips`}
              className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              {t('cta.button')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

