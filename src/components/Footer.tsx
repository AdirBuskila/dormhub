'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="bg-gray-100 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3">
        <div className="flex flex-col items-center justify-center space-y-2">
          <p className="text-sm text-gray-600">
            {t('forFurtherInfo')}
          </p>
          <a
            href="https://wa.me/972527275393"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center p-2 hover:opacity-80 transition-opacity duration-200"
            title="+972 52-727-5393"
          >
            <Image
              src="/wa.webp"
              alt="WhatsApp"
              width={30}
              height={30}
              className="h-7 w-7"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
