'use client';

import { SignUp } from '@clerk/nextjs';
import { useTranslations, useLocale } from 'next-intl';

export default function SignUpPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            DormHub {t('auth.businessSystem')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.signUpDescription')}
          </p>
        </div>
        <SignUp 
          afterSignUpUrl={`/${locale}`}
          redirectUrl={`/${locale}`}
        />
      </div>
    </div>
  );
}
