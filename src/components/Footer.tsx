'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  const t = useTranslations('footer');
  const params = useParams();
  const locale = params?.locale || 'en';

  return (
    <footer className="bg-gray-100 text-gray-800 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4">
        {/* Contact Section */}
        <div className="flex items-center justify-center mb-3">
          <a
            href="https://wa.me/9720546093624"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center p-2 hover:opacity-80 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            title="054-609-3624"
            aria-label="Contact us on WhatsApp"
          >
            <Image
              src="/wa.webp"
              alt="WhatsApp"
              width={24}
              height={24}
              className="h-6 w-6"
            />
          </a>
        </div>

        {/* Quick Links */}
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mb-3 text-xs" aria-label="Footer navigation">
          <Link 
            href={`/${locale}/privacy`}
            className="text-gray-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            {t('privacy')}
          </Link>
          <span className="text-gray-400">•</span>
          <Link 
            href={`/${locale}/terms`}
            className="text-gray-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            {t('terms')}
          </Link>
          <span className="text-gray-400">•</span>
          <Link 
            href={`/${locale}/contact`}
            className="text-gray-600 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            {t('contact')}
          </Link>
        </nav>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-xs text-gray-600">
            {t('copyright', { year: new Date().getFullYear() })}{' '}
            <a 
              href="https://github.com/AdirBuskila"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
            >
              Adir Buskila
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
