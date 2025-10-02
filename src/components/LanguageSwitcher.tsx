'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames, localeDirections } from '@/i18n/config';
import { useState } from 'react';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const switchLocale = (newLocale: string) => {
    // Get the current pathname - it might already have the locale prefix or not
    let pathWithoutLocale = pathname;
    
    // If pathname starts with a locale, remove it
    if (pathname.match(/^\/[a-z]{2}(?:\/|$)/)) {
      pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/';
    }
    
    // Ensure we have a leading slash
    if (!pathWithoutLocale.startsWith('/')) {
      pathWithoutLocale = '/' + pathWithoutLocale;
    }
    
    // Add new locale prefix
    const newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
    
    console.log('Switching language:', { 
      from: locale, 
      to: newLocale, 
      currentPath: pathname, 
      pathWithoutLocale,
      newPath 
    });
    
    router.push(newPath);
    setIsOpen(false);
  };

  const currentLocaleName = localeNames[locale as keyof typeof localeNames];
  const currentDirection = localeDirections[locale as keyof typeof localeDirections];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md hover:bg-gray-50"
        dir={currentDirection}
      >
        <Globe className="h-4 w-4" />
        <span>{currentLocaleName}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown when clicking outside */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1">
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => switchLocale(loc)}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    locale === loc ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                  }`}
                  dir={localeDirections[loc]}
                >
                  {localeNames[loc]}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
