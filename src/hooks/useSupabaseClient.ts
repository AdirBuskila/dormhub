'use client';

import { useMemo } from 'react';
import { useSession } from '@clerk/nextjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Hook to create an authenticated Supabase client for the current Clerk user
 * This client includes the Clerk session token and respects RLS policies
 */
export function useSupabaseClient(): SupabaseClient {
  const { session } = useSession();

  const supabaseAccessToken = useMemo(() => {
    return session?.getToken({ template: 'supabase' });
  }, [session]);

  const supabase = useMemo(() => {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: async (url, options = {}) => {
          const clerkToken = await supabaseAccessToken;
          
          console.log('🔑 Fetching with Clerk token:', clerkToken ? 'YES' : 'NO');
          
          const headers = new Headers(options?.headers);
          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`);
          }

          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
      auth: {
        persistSession: false,
      },
    });

    return client;
  }, [supabaseAccessToken]);

  return supabase;
}

