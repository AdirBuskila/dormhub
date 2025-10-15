'use client';

import { useTranslations } from 'next-intl';

interface CustomerErrorMessagesProps {
  type: 'auth' | 'database' | 'general';
  errorMessage?: string;
}

export default function CustomerErrorMessages({ type, errorMessage }: CustomerErrorMessagesProps) {
  const t = useTranslations('customer');

  if (type === 'auth') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
            <h2 className="text-2xl font-bold text-yellow-900 mb-2">{t('serverSideAuthIssue')}</h2>
            <p className="text-yellow-700">
              {t('clientSideAuthWorking')}
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">{t('quickFix')}:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. {t('makeSureEnvLocal')}:</li>
              <li className="ml-4">• NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</li>
              <li className="ml-4">• CLERK_SECRET_KEY</li>
              <li>2. {t('restartDevServer')}</li>
              <li>3. {t('clearBrowserCache')}</li>
            </ol>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            {t('debugInfo')}: userId={errorMessage || 'null'}
          </p>
        </div>
      </div>
    );
  }

  if (type === 'database') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto p-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-green-900 mb-2">✅ {t('authenticationWorking')}</h2>
            <p className="text-green-700">
              {t('successfullySignedIn')}
            </p>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('databaseSetupRequired')}</h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-4">
            <h4 className="font-semibold text-blue-900 mb-2">{t('quickFix')}:</h4>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>1. {t('goToSupabaseProject')}: <a href="https://supabase.com/dashboard/project/wsoaoevzcvuqypvimuee" target="_blank" className="underline">https://supabase.com/dashboard/project/wsoaoevzcvuqypvimuee</a></li>
              <li>2. {t('goToSettingsApi')}</li>
              <li>3. {t('copyAnonPublicKey')}</li>
              <li>4. {t('addThisLineToEnv')}:</li>
              <li className="ml-4 bg-gray-100 p-2 rounded font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here</li>
              <li>5. {t('restartDevServer2')}</li>
            </ol>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
            <h4 className="font-semibold text-yellow-900 mb-2">{t('currentStatus')}:</h4>
            <p className="text-sm text-yellow-800">
              • ✅ {t('clerkAuthentication')}: Working<br/>
              • ✅ {t('googleSignIn')}: Working<br/>
              • ✅ {t('userRedirect')}: Working<br/>
              • ❌ {t('databaseConnection')}: {t('needsSupabaseKey')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('errorLoadingDashboard')}</h2>
        <p className="mt-2 text-gray-600">{t('tryRefreshingPage')}</p>
        {errorMessage && (
          <p className="mt-2 text-sm text-gray-500">Error: {errorMessage}</p>
        )}
      </div>
    </div>
  );
}
