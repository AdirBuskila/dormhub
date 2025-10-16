import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getTranslations } from 'next-intl/server';
import EnhancedDashboard from '@/components/EnhancedDashboard';
import ClientRedirect from '@/components/ClientRedirect';
import WelcomePage from '@/components/WelcomePage';

export default async function Home() {
  const { userId } = await auth();
  const user = await currentUser();
  
  console.log('Home page auth check:', { 
    userId: userId ? 'exists' : 'null',
    user: user ? 'exists' : 'null',
    userEmail: user?.emailAddresses?.[0]?.emailAddress
  });
  
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
    
    // If user is authenticated and NOT admin, use client-side redirect
    if (!isAdmin) {
      console.log('Non-admin user, showing client redirect to customer portal');
      return <ClientRedirect redirectTo="/customer" />;
    }
  }
  
  // If not authenticated, show welcome page
  if (!userId || !user) {
    return <WelcomePage />;
  }
  
  // If authenticated and is admin, show the enhanced dashboard
  return <EnhancedDashboard isAdmin={true} />;
}

