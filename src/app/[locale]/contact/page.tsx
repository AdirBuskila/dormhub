import { useTranslations } from 'next-intl';
import LegalPageLayout from '@/components/LegalPageLayout';
import Image from 'next/image';

export default function ContactPage() {
  const t = useTranslations('legal.contact');

  return (
    <LegalPageLayout>
      <article className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
        
        <div className="space-y-8">
          <section>
            <p className="text-gray-700 leading-relaxed mb-6">
              {t('intro')}
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-6">
            <section className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('phoneLabel')}</h3>
              <a 
                href={`tel:${t('phoneValue')}`}
                className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              >
                {t('phoneValue')}
              </a>
            </section>

            <section className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('whatsappLabel')}</h3>
              <a
                href={`https://wa.me/972527275393`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-2xl font-bold text-green-600 hover:text-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
              >
                <Image
                  src="/wa.webp"
                  alt="WhatsApp"
                  width={32}
                  height={32}
                  className="mr-3"
                />
                {t('whatsappValue')}
              </a>
            </section>
          </div>

          <section className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('emailLabel')}</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">General: </span>
                <a 
                  href={`mailto:${t('emailGeneral')}`}
                  className="text-blue-600 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  {t('emailGeneral')}
                </a>
              </p>
              <p>
                <span className="font-medium">Support: </span>
                <a 
                  href={`mailto:${t('emailSupport')}`}
                  className="text-blue-600 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  {t('emailSupport')}
                </a>
              </p>
            </div>
          </section>

          <section className="border-t pt-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('hoursTitle')}</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {t('hoursSunThu')}
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {t('hoursFri')}
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {t('hoursSat')}
              </li>
            </ul>
          </section>

          <section className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-gray-700">
              <strong>📞 {t('responseTime')}</strong>
            </p>
            <p className="text-gray-600 mt-2">
              {t('emergencyNote')}
            </p>
          </section>
        </div>
      </article>
    </LegalPageLayout>
  );
}

