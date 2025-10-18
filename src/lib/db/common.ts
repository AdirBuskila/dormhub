// Common database utilities

import { getSupabaseClient } from '../supabase';
import type { InfoPage } from '@/types/database';

/**
 * Get an info page by slug
 */
export async function getInfoPageBySlug(slug: string): Promise<InfoPage | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('info_pages')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) {
    console.error('Error fetching info page:', error);
    return null;
  }

  return data;
}

/**
 * Get all published info pages
 */
export async function getPublishedInfoPages(): Promise<InfoPage[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('info_pages')
    .select('*')
    .eq('published', true)
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching info pages:', error);
    return [];
  }

  return data || [];
}

/**
 * Create an info page (admin only)
 */
export async function createInfoPage(
  payload: Pick<InfoPage, 'slug' | 'title' | 'body_md' | 'published'>,
  authorId: string
): Promise<InfoPage> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('info_pages')
    .insert({
      ...payload,
      author_id: authorId,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Error creating info page:', error);
    throw new Error(`Failed to create info page: ${error?.message || 'Unknown error'}`);
  }

  return data;
}

/**
 * Update an info page (admin only)
 */
export async function updateInfoPage(
  pageId: string,
  updates: Partial<Pick<InfoPage, 'title' | 'body_md' | 'published'>>
): Promise<InfoPage> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('info_pages')
    .update(updates)
    .eq('id', pageId)
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating info page:', error);
    throw new Error(`Failed to update info page: ${error?.message || 'Not found'}`);
  }

  return data;
}

