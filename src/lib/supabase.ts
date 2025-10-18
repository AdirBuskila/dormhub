import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wsoaoevzcvuqypvimuee.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

// Client-side Supabase client (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client for admin operations (bypasses RLS)
export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Get a Supabase client for server-side operations
 * Uses service role key to bypass RLS (for server operations)
 * For client-side operations, use the `supabase` export directly
 */
export function getSupabaseClient() {
  return supabaseAdmin;
}

/**
 * Get a Supabase client with anon key (respects RLS)
 * Use this for operations that should respect row-level security
 */
export function getSupabaseAnonClient() {
  return supabase;
}
