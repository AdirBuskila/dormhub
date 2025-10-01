import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import OrderManagement from '@/components/OrderManagement';

export default async function OrdersPage() {
  const { userId } = await auth();
  const user = await currentUser();
  
  // Check if user is admin
  let isAdmin = false;
  if (userId && user) {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
    const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();
    isAdmin = userEmail ? adminEmails.includes(userEmail) : false;
  }
  
  // Redirect non-admin users to customer portal
  if (userId && user && !isAdmin) {
    redirect('/customer');
  }
  
  return <OrderManagement isAdmin={isAdmin} />;
}
