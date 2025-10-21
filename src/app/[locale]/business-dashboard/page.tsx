import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import BusinessDashboard from '@/components/business/BusinessDashboard';

export default async function BusinessDashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect('/sign-in');
  }

  // Fetch the business owned by this user
  const { data: business, error } = await supabaseAdmin
    .from('businesses')
    .select(`
      *,
      business_hours (*),
      student_discounts (*)
    `)
    .eq('owner_clerk_id', userId)
    .single();

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Business Found
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have a business registered on DormHub yet. Please contact us to set up your business account.
          </p>
          <a
            href={`tel:0546093624`}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    );
  }

  // Serialize user data to pass to client component (only pass what we need)
  const userData = {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
  };

  return <BusinessDashboard business={business} userData={userData} />;
}

