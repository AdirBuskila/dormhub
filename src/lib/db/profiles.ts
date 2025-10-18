// Profile database operations

import { getSupabaseClient } from '../supabase';
import type { Profile, UpdateProfileInput } from '@/types/database';

/**
 * Get a profile by ID
 */
export async function getProfileById(profileId: string): Promise<Profile | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

/**
 * Get a profile by Clerk ID
 */
export async function getProfileByClerkId(clerkId: string): Promise<Profile | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (error) {
    console.error('Error fetching profile by Clerk ID:', error);
    return null;
  }

  return data;
}

/**
 * Get a profile by username
 */
export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    console.error('Error fetching profile by username:', error);
    return null;
  }

  return data;
}

/**
 * Update a profile
 */
export async function updateProfile(profileId: string, updates: UpdateProfileInput): Promise<Profile | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  return data;
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(username: string, excludeProfileId?: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('profiles')
    .select('id')
    .eq('username', username);

  if (excludeProfileId) {
    query = query.neq('id', excludeProfileId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error checking username availability:', error);
    return false;
  }

  return data.length === 0;
}

