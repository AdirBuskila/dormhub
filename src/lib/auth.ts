// DormHub Authentication
// Integrates Clerk auth with Supabase profiles

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getSupabaseClient } from './supabase';
import type { CurrentUser, Profile } from '@/types/database';

// Admin emails from environment
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

/**
 * Get or create a profile for the current Clerk user
 * This ensures every Clerk user has a corresponding profile in Supabase
 */
async function getOrCreateProfile(clerkId: string, email: string, fullName?: string): Promise<Profile> {
  const supabase = getSupabaseClient();

  // Try to find existing profile
  const { data: existingProfile, error: selectError } = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (existingProfile && !selectError) {
    return existingProfile;
  }

  // Create new profile
  const { data: newProfile, error: insertError } = await supabase
    .from('profiles')
    .insert({
      clerk_id: clerkId,
      full_name: fullName || null,
    })
    .select()
    .single();

  if (insertError || !newProfile) {
    console.error('Failed to create profile:', insertError);
    throw new Error('Failed to create user profile');
  }

  return newProfile;
}

/**
 * Get the current authenticated user with profile data
 * Throws an error if not authenticated
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    throw new Error('User not authenticated');
  }

  const email = user.emailAddresses[0]?.emailAddress || '';
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || undefined;

  // Get or create profile
  const profile = await getOrCreateProfile(userId, email, fullName);

  // Check if user is admin
  const isAdmin = ADMIN_EMAILS.includes(email) || false;

  return {
    clerkId: userId,
    profileId: profile.id,
    fullName: profile.full_name || undefined,
    username: profile.username || undefined,
    email,
    isAdmin,
  };
}

/**
 * Get the current authenticated user (optional)
 * Returns null if not authenticated
 */
export async function getOptionalUser(): Promise<CurrentUser | null> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const user = await currentUser();

    if (!user) {
      return null;
    }

    const email = user.emailAddresses[0]?.emailAddress || '';
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || undefined;

    // Get or create profile
    const profile = await getOrCreateProfile(userId, email, fullName);

    // Check if user is admin
    const isAdmin = ADMIN_EMAILS.includes(email) || false;

    return {
      clerkId: userId,
      profileId: profile.id,
      fullName: profile.full_name || undefined,
      username: profile.username || undefined,
      email,
      isAdmin,
    };
  } catch (error) {
    console.error('Error getting optional user:', error);
    return null;
  }
}

/**
 * Require authentication - throws error if not authenticated
 * Use this in server components/actions that require auth
 */
export async function requireAuth(): Promise<CurrentUser> {
  const user = await getOptionalUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

/**
 * Require authentication and redirect to sign-in if not authenticated
 * Use this in pages that require auth
 */
export async function requireAuthWithRedirect(redirectTo?: string): Promise<CurrentUser> {
  const user = await getOptionalUser();

  if (!user) {
    const returnUrl = redirectTo || '/';
    redirect(`/sign-in?redirect=${encodeURIComponent(returnUrl)}`);
  }

  return user;
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getOptionalUser();
  return user?.isAdmin || false;
}

/**
 * Require admin access - throws error if not admin
 */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireAuth();

  if (!user.isAdmin) {
    throw new Error('Admin access required');
  }

  return user;
}

/**
 * Require admin access with redirect
 */
export async function requireAdminWithRedirect(redirectTo = '/'): Promise<CurrentUser> {
  const user = await getOptionalUser();

  if (!user || !user.isAdmin) {
    redirect(redirectTo);
  }

  return user;
}

/**
 * Get the current user's profile ID (for use in queries)
 */
export async function getCurrentProfileId(): Promise<string> {
  const user = await getCurrentUser();
  return user.profileId;
}

/**
 * Check if a profile belongs to the current user
 */
export async function isOwnProfile(profileId: string): Promise<boolean> {
  const user = await getOptionalUser();
  return user?.profileId === profileId;
}

/**
 * Check if a listing belongs to the current user
 */
export async function isOwnListing(ownerId: string): Promise<boolean> {
  const user = await getOptionalUser();
  return user?.profileId === ownerId;
}

// ============================================================================
// LEGACY COMPATIBILITY (for gradual migration)
// ============================================================================

export interface ClerkUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * @deprecated Use getCurrentUser() instead
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
    lastName: user.lastName || '',
  };
}
