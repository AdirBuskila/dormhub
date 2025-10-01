import { auth, currentUser } from '@clerk/nextjs/server';
import Layout from './Layout';

/**
 * Server component wrapper that checks admin status and passes to client Layout
 */
export default async function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  const user = await currentUser();
  
  // Check if user is admin
  let isAdmin = false;
  if (userId && user) {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
    const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();
    isAdmin = userEmail ? adminEmails.includes(userEmail) : false;
  }

  return <Layout isAdmin={isAdmin}>{children}</Layout>;
}
