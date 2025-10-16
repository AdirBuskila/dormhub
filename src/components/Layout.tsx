'use client';

import { useState, useEffect } from 'react';
import { UserButton, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import LanguageSwitcher from './LanguageSwitcher';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  CreditCard,
  RotateCcw,
  Bell,
  Menu,
  X,
  Smartphone,
  Tablet,
  Headphones,
  Wrench
} from 'lucide-react';
import AlertsBell from './AlertsBell';
import Footer from './Footer';

const categoryIcons = {
  phone: Smartphone,
  tablet: Tablet,
  earphones: Headphones,
  accessories: Wrench,
};

interface LayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

export default function Layout({ children, isAdmin = false }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const t = useTranslations();
  const locale = useLocale();

  // Handle sidebar close with animation
  const handleCloseSidebar = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSidebarOpen(false);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  // Define navigation based on admin status and login state
  const navigation = isAdmin ? [
    { name: t('navigation.dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('navigation.inventory'), href: '/inventory', icon: Package },
    { name: t('navigation.clients'), href: '/clients', icon: Users },
    { name: t('navigation.orders'), href: '/orders', icon: ShoppingCart },
    { name: t('navigation.returns'), href: '/returns', icon: RotateCcw },
    { name: t('navigation.alerts'), href: '/alerts', icon: Bell },
  ] : isSignedIn ? [
    { name: t('navigation.newOrder'), href: '/customer/new-order', icon: ShoppingCart },
    { name: t('navigation.myOrders'), href: '/customer', icon: Package },
  ] : [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          {/* Backdrop with fade animation */}
          <div 
            className={`fixed inset-0 bg-gray-600 transition-opacity duration-300 ease-in-out ${
              isClosing ? 'bg-opacity-0' : 'bg-opacity-75'
            }`}
            onClick={handleCloseSidebar} 
          />
          
          {/* Sidebar with smooth slide animation */}
          <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl transform transition-all duration-300 ease-out ${
            isClosing ? '-translate-x-full' : 'translate-x-0'
          }`} style={{ animation: isClosing ? 'none' : 'slideIn 0.3s ease-out' }}>
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-all hover:scale-110 active:scale-95 hover:bg-white hover:bg-opacity-10"
                onClick={handleCloseSidebar}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent pathname={pathname} navigation={navigation} locale={locale} />
          </div>
        </div>
      )}

      {/* CSS Animation for sidebar slide-in */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>

      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        {isSignedIn && (
          <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64">
              <SidebarContent pathname={pathname} navigation={navigation} locale={locale} />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {/* Top navigation */}
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
            {isSignedIn && (
              <button
                type="button"
                className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden hover:bg-gray-50 active:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <div className="flex-1 px-4 flex justify-between">
              <div className="flex-1 flex">
                <div className="w-full flex md:ml-0">
                  <div className="flex items-center">
                    <h1 className="text-lg font-medium text-gray-900">
                      {isAdmin ? t('auth.businessSystem') : t('auth.customerPortal')}
                    </h1>
                  </div>
                </div>
              </div>
              <div className="ml-4 flex items-center space-x-4 md:ml-6">
                <LanguageSwitcher />
                {isAdmin && <AlertsBell />}
                {isSignedIn ? (
                  <UserButton afterSignOutUrl={`/${locale}`} />
                ) : (
                  <SignInButton mode="modal">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      {t('auth.signIn')}
                    </button>
                  </SignInButton>
                )}
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

function SidebarContent({ pathname, navigation, locale }: { pathname: string; navigation: Array<{ name: string; href: string; icon: any }>; locale: string }) {
  return (
    <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="Mobile For You Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="ml-3 text-xl font-bold text-gray-900">Mobile For You</span>
          </Link>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            // Handle locale prefixes in pathname comparison
            let isActive = false;
            if (item.href === '/') {
              // For dashboard (root), check if we're on the exact root or locale root
              isActive = pathname === '/' || pathname === `/${locale}` || pathname.endsWith('/');
            } else {
              // For other items, check exact match or ends with
              isActive = pathname === item.href || pathname.endsWith(item.href);
            }
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? 'bg-indigo-100 text-indigo-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500',
                    'mr-3 flex-shrink-0 h-6 w-6'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
