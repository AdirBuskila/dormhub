'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useLocale } from 'next-intl';
import ClientOnboardingModal from './ClientOnboardingModal';

interface ClientRedirectProps {
  redirectTo: string;
  isAdmin?: boolean;
}

export default function ClientRedirect({ redirectTo, isAdmin = false }: ClientRedirectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { isSignedIn, isLoaded, user } = useUser();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    async function checkProfileAndRedirect() {
      if (isLoaded && isSignedIn && !isAdmin) {
        try {
          // Check if client profile is complete
          const response = await fetch(`/api/clients/${user?.id}`);
          if (response.ok) {
            const client = await response.json();
            const isProfileComplete = client.phone && client.address && client.name;
            
            if (!isProfileComplete) {
              setShowOnboarding(true);
              setCheckingProfile(false);
              return;
            }
          }
        } catch (error) {
          console.error('Error checking client profile:', error);
        }
      }
      
      setCheckingProfile(false);
      
      if (isLoaded && isSignedIn) {
        // Ensure the redirect path includes the locale
        const localeRedirectTo = redirectTo.startsWith('/') ? `/${locale}${redirectTo}` : `/${locale}/${redirectTo}`;
        router.push(localeRedirectTo);
      }
    }

    checkProfileAndRedirect();
  }, [isLoaded, isSignedIn, redirectTo, router, locale, isAdmin, user?.id]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Redirect after onboarding is complete
    const localeRedirectTo = redirectTo.startsWith('/') ? `/${locale}${redirectTo}` : `/${locale}/${redirectTo}`;
    router.push(localeRedirectTo);
  };

  if (showOnboarding) {
    return (
      <ClientOnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span className="ml-2">
        {checkingProfile ? 'Checking profile...' : 'Redirecting...'}
      </span>
    </div>
  );
}
