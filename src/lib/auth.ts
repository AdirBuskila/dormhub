import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export interface ClerkUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * Get the authenticated Clerk user data (server-side only)
 * Throws an error if not authenticated (let middleware handle redirect)
 */
export async function getAuthenticatedUser(): Promise<ClerkUser> {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId || !user) {
    throw new Error('User not authenticated');
  }

  return {
    userId: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    firstName: user.firstName || '',
    lastName: user.lastName || ''
  };
}

/**
 * Get the authenticated Clerk user data (server-side only)
 * Returns null if not authenticated (doesn't redirect)
 */
export async function getOptionalUser(): Promise<ClerkUser | null> {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const user = await currentUser();
  
  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    firstName: user.firstName || '',
    lastName: user.lastName || ''
  };
}
