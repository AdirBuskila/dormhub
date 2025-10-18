import { useTranslations } from 'next-intl';
import LegalPageLayout from '@/components/LegalPageLayout';

export default function PrivacyPolicyPage() {
  const t = useTranslations('legal.privacy');
  
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <LegalPageLayout>
      <article className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
        <p className="text-sm text-gray-500 mb-8">{t('lastUpdated', { date: currentDate })}</p>
        
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

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">{t('section4Title')}</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {t('section4Content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">{t('section5Title')}</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {t('section5Content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">{t('section6Title')}</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {t('section6Content')}
            </p>
          </section>
        </div>
      </article>
    </LegalPageLayout>
  );
}

