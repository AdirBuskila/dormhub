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

    console.log('Creating client for user:', clerkUser);
    const client = await upsertClientFromClerkUser(clerkUser);
    console.log('Client created/found:', client);
    return <NewOrderPage clientId={client.id} />;
  } catch (error) {
    console.error('New order page error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900">Error Loading Order Page</h2>
          <p className="mt-2 text-gray-600">Failed to create or find your client account.</p>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {errorMessage}
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
}
