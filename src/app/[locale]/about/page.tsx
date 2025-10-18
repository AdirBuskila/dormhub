import { useTranslations } from 'next-intl';
import LegalPageLayout from '@/components/LegalPageLayout';

export default function AboutPage() {
  const t = useTranslations('legal.about');

  return (
    <LegalPageLayout>
      <article className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
        
        <div className="space-y-8">
          <section>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {t('intro')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">{t('section1Title')}</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {t('section1Content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">{t('section2Title')}</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {t('section2Content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">{t('section3Title')}</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {t('section3Content')}
            </p>
          </section>

          <section className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">{t('section4Title')}</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {t('section4Content')}
            </p>
          </section>
        </div>
      </article>
    </LegalPageLayout>
  );
}

