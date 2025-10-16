'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useLocale, useTranslations } from 'next-intl';
import ClientOnboardingModal from './ClientOnboardingModal';

interface ClientRedirectProps {
  redirectTo: string;
  isAdmin?: boolean;
}

export default function ClientRedirect({ redirectTo, isAdmin = false }: ClientRedirectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();
  const { isSignedIn, isLoaded, user } = useUser();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    async function checkProfileAndRedirect() {
      if (isLoaded && isSignedIn && !isAdmin) {
        try {
          // Check if client profile is complete
          console.log('Checking client profile for user:', user?.id);
          const response = await fetch(`/api/clients/${user?.id}`);
          console.log('Client API response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Client data:', data);
            // Check if profile is complete - use the new fields
            const isProfileComplete = data.phone && data.city && data.shop_name;
            
            if (!isProfileComplete) {
              console.log('Profile incomplete, showing onboarding modal');
              setShowOnboarding(true);
              setCheckingProfile(false);
              return;
            } else {
              console.log('Profile complete, proceeding with redirect');
            }
          } else {
            console.log('Client not found, showing onboarding modal');
            setShowOnboarding(true);
            setCheckingProfile(false);
            return;
          }
        } catch (error) {
          console.error('Error checking client profile:', error);
          // If there's an error, show onboarding to be safe
          setShowOnboarding(true);
          setCheckingProfile(false);
          return;
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
    <div className="flex items-center justify-center h-64 gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span>
        {checkingProfile ? t('common.checkingProfile') : t('common.redirecting')}
      </span>
    </div>
  );
}
