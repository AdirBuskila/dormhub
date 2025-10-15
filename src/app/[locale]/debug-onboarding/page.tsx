import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DebugOnboarding() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId || !user) {
    redirect('/sign-in');
  }

  // Check if user is admin
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
  const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();
  const isAdmin = userEmail ? adminEmails.includes(userEmail) : false;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Onboarding Debug</h1>
        
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">User Information</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>User ID:</strong> {userId}
            </div>
            <div>
              <strong>Email:</strong> {userEmail}
            </div>
            <div>
              <strong>Is Admin:</strong> {isAdmin ? '✅ Yes' : '❌ No'}
            </div>
            <div>
              <strong>Admin Emails:</strong> {adminEmails.join(', ')}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Expected Behavior:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>If <strong>Is Admin = Yes</strong>: Should see admin dashboard</li>
              <li>If <strong>Is Admin = No</strong>: Should see client onboarding modal</li>
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>Check if your email is in the ADMIN_EMAILS environment variable</li>
              <li>If you want to test onboarding, make sure your email is NOT in ADMIN_EMAILS</li>
              <li>Clear browser cache and cookies</li>
              <li>Sign out and sign in again</li>
              <li>Go to the home page to see the onboarding flow</li>
            </ol>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900">Environment Variables Check:</h4>
            <p className="text-sm text-blue-700 mt-1">
              ADMIN_EMAILS should be set in your Vercel environment variables or .env.local file.
              Current value: {process.env.ADMIN_EMAILS || 'Not set'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
