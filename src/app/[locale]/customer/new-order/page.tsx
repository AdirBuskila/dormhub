import { auth, currentUser } from '@clerk/nextjs/server';
import { upsertClientFromClerkUser } from '@/lib/db/clients';
import NewOrderPage from '@/components/customer/NewOrderPage';

export default async function NewOrder() {
  // Get authenticated user - middleware already ensures we're authenticated
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Authentication Error</h2>
          <p className="mt-2 text-gray-600">Please try signing in again.</p>
        </div>
      </div>
    );
  }

  try {
    // Create client user data
    const clerkUser = {
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName || '',
      lastName: user.lastName || ''
    };

    const client = await upsertClientFromClerkUser(clerkUser);
    return <NewOrderPage clientId={client.id} />;
  } catch (error) {
    console.error('New order page error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Error Loading Order Page</h2>
          <p className="mt-2 text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }
}
