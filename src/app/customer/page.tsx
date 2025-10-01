import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { upsertClientFromClerkUser, getClientOrders } from '@/lib/db/clients';
import CustomerDashboard from '@/components/customer/CustomerDashboard';

export default async function CustomerPage() {
  // Try both auth() and currentUser() to see which one works
  const { userId } = await auth();
  const user = await currentUser();
  
  console.log('Customer page auth check:', { 
    userId, 
    user: user ? 'exists' : 'null',
    userEmail: user?.emailAddresses?.[0]?.emailAddress,
    userFirstName: user?.firstName,
    hasUser: !!user,
    userKeys: user ? Object.keys(user) : [],
    authMethod: 'currentUser'
  });
  
  if (!userId || !user) {
    // This means server-side auth isn't working properly
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
            <h2 className="text-2xl font-bold text-yellow-900 mb-2">Server-Side Auth Issue</h2>
            <p className="text-yellow-700">
              Client-side authentication is working, but server-side needs configuration.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">Quick Fix:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Make sure your <code>.env.local</code> has:</li>
              <li className="ml-4">• NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</li>
              <li className="ml-4">• CLERK_SECRET_KEY</li>
              <li>2. Restart your development server</li>
              <li>3. Clear browser cache and try again</li>
            </ol>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Debug info: userId={userId ? 'exists' : 'null'}, user={user ? 'exists' : 'null'}
          </p>
        </div>
      </div>
    );
  }

  // Check if user is admin and redirect to admin panel
  const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
  
  if (userEmail && adminEmails.includes(userEmail)) {
    console.log('Admin user detected, redirecting to admin panel:', userEmail);
    redirect('/');
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
    const orders = await getClientOrders(client.id);

    return <CustomerDashboard client={client} orders={orders} />;
  } catch (error) {
    console.error('Customer page error:', error);
    
    // Check if it's a Supabase configuration error
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isSupabaseError = errorMessage.includes('placeholder') || 
                           errorMessage.includes('Invalid API key') ||
                           errorMessage.includes('Failed to fetch') ||
                           errorMessage.includes('Failed to create client') ||
                           errorMessage.includes('JWT') ||
                           errorMessage.includes('unauthorized');
    
    if (isSupabaseError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-lg mx-auto p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-green-900 mb-2">✅ Authentication Working!</h2>
              <p className="text-green-700">
                You successfully signed in with Google! The issue is just database configuration.
              </p>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Database Setup Required</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-4">
              <h4 className="font-semibold text-blue-900 mb-2">Quick Fix:</h4>
              <ol className="text-sm text-blue-800 space-y-2">
                <li>1. Go to your Supabase project: <a href="https://supabase.com/dashboard/project/wsoaoevzcvuqypvimuee" target="_blank" className="underline">https://supabase.com/dashboard/project/wsoaoevzcvuqypvimuee</a></li>
                <li>2. Go to <strong>Settings → API</strong></li>
                <li>3. Copy the <strong>"anon public"</strong> key</li>
                <li>4. Add this line to your <code>.env.local</code> file:</li>
                <li className="ml-4 bg-gray-100 p-2 rounded font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here</li>
                <li>5. Restart your development server</li>
              </ol>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
              <h4 className="font-semibold text-yellow-900 mb-2">Current Status:</h4>
              <p className="text-sm text-yellow-800">
                • ✅ Clerk Authentication: Working<br/>
                • ✅ Google Sign-in: Working<br/>
                • ✅ User Redirect: Working<br/>
                • ❌ Database Connection: Needs Supabase key
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Error Loading Dashboard</h2>
          <p className="mt-2 text-gray-600">Please try refreshing the page.</p>
          <p className="mt-2 text-sm text-gray-500">Error: {errorMessage}</p>
        </div>
      </div>
    );
  }
}
