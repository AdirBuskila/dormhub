import { auth, currentUser } from '@clerk/nextjs/server';

/**
 * Check if the current user is an admin
 * Admins are defined by email in the ADMIN_EMAILS environment variable
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return false;
    }

    // Get admin emails from environment variable
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
    
    // Check if user's email is in the admin list
    const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();
    
    if (!userEmail) {
      return false;
    }

    return adminEmails.includes(userEmail);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Check if the current user is an admin (client-side version)
 * Returns the email for client-side admin check
 */
export function getAdminEmails(): string[] {
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
  return adminEmails;
}
