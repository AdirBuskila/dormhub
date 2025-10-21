import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { requireAuth } from '@/lib/auth';
import { getProfileByClerkId } from '@/lib/db/profiles';
import { getSupabaseClient } from '@/lib/supabase';
import ProfileForm from '@/components/profile/ProfileForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'profile' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // Require authentication
  let user;
  try {
    user = await requireAuth();
  } catch {
    redirect(`/${locale}/sign-in?redirect=${encodeURIComponent(`/${locale}/profile`)}`);
  }

  // Get profile data
  const profile = await getProfileByClerkId(user.clerkId);
  
  if (!profile) {
    redirect(`/${locale}`);
  }

  // Check if user is a business owner
  const supabase = getSupabaseClient();
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_clerk_id', user.clerkId)
    .single();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Profile Settings
            </h1>
            <p className="text-gray-600">
              Manage your personal information and preferences
            </p>
          </div>

          {/* Business Owner Section */}
          {business && (
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 animate-fade-in">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-600 text-white rounded-full p-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Business Owner</h3>
                    <p className="text-purple-700 font-medium">{business.name}</p>
                  </div>
                </div>
                <a
                  href={`/${locale}/business-dashboard`}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                >
                  Manage Business
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>
            </div>
          )}

          {/* Profile Form */}
          <ProfileForm 
            profile={profile} 
            email={user.email}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}

