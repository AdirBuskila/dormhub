'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { UserButton, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import LanguageSwitcher from './LanguageSwitcher';

interface NavbarProps {
  isAdmin?: boolean;
}

export default function Navbar({ isAdmin = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const params = useParams();
  const pathname = usePathname();
  const locale = params?.locale || 'en';
  const t = useTranslations('navigation');
  const { isSignedIn } = useUser();

  const navigation = [
    { name: t('home'), href: `/${locale}` },
    { name: t('marketplace'), href: `/${locale}/marketplace` },
    { name: t('tips'), href: `/${locale}/tips` },
    { name: t('businesses'), href: `/${locale}/businesses` },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center">
              <Image
                src="/logo.png"
                alt="DormHub Logo"
                width={48}
                height={48}
                className="h-12 w-12"
              />
              <span className="ml-2 text-xl font-bold text-gray-900">
                DormHub
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side - Language Switcher and Auth */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link
                    href={`/${locale}/admin`}
                    className="hidden md:flex items-center gap-2 text-purple-700 hover:text-purple-800 transition-colors px-3 py-2 rounded-md hover:bg-purple-50"
                    title="Admin Panel"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">Admin</span>
                  </Link>
                )}
                <Link
                  href={`/${locale}/profile`}
                  className="hidden md:flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">{t('profile')}</span>
                </Link>
                <UserButton afterSignOutUrl={`/${locale}`} />
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  href={`/${locale}/sign-in`}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  {t('signIn')}
                </Link>
                <Link
                  href={`/${locale}/sign-up`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t('signUp')}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <div className="relative h-6 w-6">
                <svg 
                  className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg 
                  className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu with slide animation */}
      <div
        className={`md:hidden border-t border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navigation.map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              } ${mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}
              style={{ 
                transitionDelay: mobileMenuOpen ? `${index * 50}ms` : '0ms'
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          
          {isSignedIn && (
            <>
              {isAdmin && (
                <Link
                  href={`/${locale}/admin`}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 text-purple-700 hover:bg-purple-50 hover:text-purple-900 ${mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}
                  style={{ 
                    transitionDelay: mobileMenuOpen ? `${navigation.length * 50}ms` : '0ms'
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              <Link
                href={`/${locale}/profile`}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 ${mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}
                style={{ 
                  transitionDelay: mobileMenuOpen ? `${(navigation.length + (isAdmin ? 1 : 0)) * 50}ms` : '0ms'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('profile')}
              </Link>
            </>
          )}
        </div>
        
        {!isSignedIn && (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-2 space-y-1">
              <Link
                href={`/${locale}/sign-in`}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('signIn')}
              </Link>
              <Link
                href={`/${locale}/sign-up`}
                className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('signUp')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}



