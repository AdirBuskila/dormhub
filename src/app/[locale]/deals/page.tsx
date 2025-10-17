import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import DealsManagement from '@/components/DealsManagement';

export default async function DealsPage() {
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

  return <DealsManagement />;
}

