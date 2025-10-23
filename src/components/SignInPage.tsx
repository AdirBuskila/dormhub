'use client';

import { SignIn } from '@clerk/nextjs';
import { useLocale } from 'next-intl';

export default function SignInPage() {
  const locale = useLocale();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <SignIn 
        afterSignInUrl={`/${locale}`}
        redirectUrl={`/${locale}`}
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-lg',
            headerTitle: 'text-2xl font-bold',
            headerSubtitle: 'text-gray-600',
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
            footerActionLink: 'text-blue-600 hover:text-blue-700',
          },
          layout: {
            logoImageUrl: '/logo.png',
            socialButtonsPlacement: 'top',
          }
        }}
      />
    </div>
  );
}
