import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import InventoryManagement from '@/components/InventoryManagement';

export default async function InventoryPage() {
  const { userId } = await auth();
  const user = await currentUser();
  
  // Check if user is admin
  let isAdmin = false;
  if (userId && user) {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
    const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();
    isAdmin = userEmail ? adminEmails.includes(userEmail) : false;
    
    console.log('Inventory page admin check:', { 
      userEmail, 
      adminEmails, 
      isAdmin 
    });
  }
  
  // Redirect non-admin users to customer portal
  if (userId && user && !isAdmin) {
    console.log('Non-admin user accessing inventory, redirecting to customer');
    redirect('/customer');
  }
  
  return <InventoryManagement isAdmin={isAdmin} />;
}
