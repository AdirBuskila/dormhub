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
  isBusinessOwner?: boolean;
}

export default function Navbar({ isAdmin = false, isBusinessOwner = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const params = useParams();
  const pathname = usePathname();
  const locale = params?.locale || 'en';
  const t = useTranslations('navigation');
  const { isSignedIn } = useUser();

  const navigation = [
    { 
      name: t('home'), 
      href: `/${locale}`,
      icon: '🏠',
      color: 'from-blue-400 to-blue-600'
    },
    { 
      name: t('marketplace'), 
      href: `/${locale}/marketplace`,
      icon: '🛒',
      color: 'from-green-400 to-emerald-600'
    },
    { 
      name: t('tips'), 
      href: `/${locale}/tips`,
      icon: '💡',
      color: 'from-yellow-400 to-amber-600'
    },
    { 
      name: t('businesses'), 
      href: `/${locale}/businesses`,
      icon: '🏪',
      color: 'from-purple-400 to-purple-600'
    },
    { 
      name: t('hotDeals'), 
      href: `/${locale}/hot-deals`, 
      special: true,
      icon: '🔥',
      color: 'from-orange-500 to-red-500'
    },
    { 
      name: t('calendar'), 
      href: `/${locale}/dorm-calendar`,
      icon: '📅',
      color: 'from-pink-400 to-rose-600'
    },
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
                  className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    item.special
                      ? isActive(item.href)
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md hover:shadow-lg'
                        : 'bg-gradient-to-r from-orange-400 to-red-400 text-white hover:from-orange-500 hover:to-red-500 shadow-md'
                      : isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
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
                {isBusinessOwner && (
                  <Link
                    href={`/${locale}/business-dashboard`}
                    className="hidden md:flex items-center gap-2 text-blue-700 hover:text-blue-800 transition-colors px-3 py-2 rounded-md hover:bg-blue-50"
                    title="Manage Business"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="font-medium">{t('manageBusiness')}</span>
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
        className={`md:hidden border-t border-gray-100 overflow-hidden transition-all duration-300 ease-in-out bg-gradient-to-b from-gray-50 to-white ${
          mobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-3 pt-3 pb-4 space-y-2">
          {navigation.map((item, index) => {
            const isActiveLink = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 overflow-hidden ${
                  isActiveLink
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-[1.02]`
                    : 'bg-white text-gray-700 hover:shadow-md border border-gray-100 hover:border-gray-200'
                } ${mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}
                style={{ 
                  transitionDelay: mobileMenuOpen ? `${index * 60}ms` : '0ms'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {/* Icon background glow for active state */}
                {isActiveLink && (
                  <div className="absolute inset-0 bg-white/10 animate-pulse" />
                )}
                
                {/* Icon */}
                <span className={`relative text-2xl flex-shrink-0 transition-transform duration-300 ${
                  isActiveLink ? '' : 'group-hover:scale-110'
                }`}>
                  {item.icon}
                </span>
                
                {/* Text */}
                <span className="relative flex-1">{item.name}</span>
                
                {/* Arrow indicator for active */}
                {isActiveLink && (
                  <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                )}
                
                {/* Subtle gradient overlay for non-active items */}
                {!isActiveLink && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                )}
              </Link>
            );
          })}
          
          {isSignedIn && (
            <>
              {isAdmin && (
                <Link
                  href={`/${locale}/admin`}
                  className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md hover:shadow-lg ${mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}
                  style={{ 
                    transitionDelay: mobileMenuOpen ? `${navigation.length * 60}ms` : '0ms'
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-2xl">⚙️</span>
                  <span>Admin Panel</span>
                  <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
              {isBusinessOwner && (
                <Link
                  href={`/${locale}/business-dashboard`}
                  className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg ${mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}
                  style={{ 
                    transitionDelay: mobileMenuOpen ? `${(navigation.length + (isAdmin ? 1 : 0)) * 60}ms` : '0ms'
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-2xl">🏪</span>
                  <span>{t('manageBusiness')}</span>
                  <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
              <Link
                href={`/${locale}/profile`}
                className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 bg-white text-gray-700 hover:shadow-md border border-gray-100 hover:border-gray-200 ${mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}
                style={{ 
                  transitionDelay: mobileMenuOpen ? `${(navigation.length + (isAdmin ? 1 : 0) + (isBusinessOwner ? 1 : 0)) * 60}ms` : '0ms'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-2xl">👤</span>
                <span>{t('profile')}</span>
                <svg className="w-5 h-5 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </>
          )}
        </div>
        
        {!isSignedIn && (
          <div className="px-3 pt-3 pb-4 border-t border-gray-200 space-y-2">
            <Link
              href={`/${locale}/sign-in`}
              className="group flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 bg-white text-gray-700 hover:shadow-md border border-gray-200 hover:border-gray-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="text-xl">🔑</span>
              <span>{t('signIn')}</span>
            </Link>
            <Link
              href={`/${locale}/sign-up`}
              className="group flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="text-xl">✨</span>
              <span>{t('signUp')}</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}



