import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { upsertClientFromClerkUser, getClientOrders } from '@/lib/db/clients';
import CustomerDashboard from '@/components/customer/CustomerDashboard';
import CustomerErrorMessages from '@/components/customer/CustomerErrorMessages';

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
    return <CustomerErrorMessages type="auth" errorMessage={`userId=${userId ? 'exists' : 'null'}, user=${user ? 'exists' : 'null'}`} />;
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

    return <CustomerDashboard client={client} orders={orders as any} />;
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
      return <CustomerErrorMessages type="database" />;
    }
    
    return <CustomerErrorMessages type="general" errorMessage={errorMessage} />;
  }
}
