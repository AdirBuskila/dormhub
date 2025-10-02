import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function ReturnsPage() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId || !user) {
    redirect('/sign-in');
  }

  // Check if user is admin
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
  const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();
  const isAdmin = userEmail ? adminEmails.includes(userEmail) : false;
  
  if (!isAdmin) {
    redirect('/customer');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Returns Management</h1>
        <p className="mt-2 text-gray-600">This page is under development.</p>
      </div>
    </div>
  );
}
