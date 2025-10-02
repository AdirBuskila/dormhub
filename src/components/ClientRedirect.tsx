'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useLocale } from 'next-intl';

interface ClientRedirectProps {
  redirectTo: string;
}

export default function ClientRedirect({ redirectTo }: ClientRedirectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Ensure the redirect path includes the locale
      const localeRedirectTo = redirectTo.startsWith('/') ? `/${locale}${redirectTo}` : `/${locale}/${redirectTo}`;
      router.push(localeRedirectTo);
    }
  }, [isLoaded, isSignedIn, redirectTo, router, locale]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span className="ml-2">Redirecting...</span>
    </div>
  );
}
