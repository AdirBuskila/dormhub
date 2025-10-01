import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import Dashboard from '@/components/Dashboard';

export default async function Home() {
  const { userId } = await auth();
  const user = await currentUser();
  
  // Check if user is admin
  let isAdmin = false;
  if (userId && user) {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
    const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();
    isAdmin = userEmail ? adminEmails.includes(userEmail) : false;
    
    console.log('Home page admin check:', { 
      userEmail, 
      adminEmails, 
      isAdmin 
    });
  }
  
  // If user is authenticated and NOT admin, redirect to customer portal
  if (userId && user && !isAdmin) {
    console.log('Non-admin user, redirecting to customer portal');
    redirect('/customer');
  }
  
  // If not authenticated or is admin, show the main dashboard
  return <Dashboard isAdmin={isAdmin} />;
}
