// Tip database operations

import { getSupabaseClient } from '../supabase';
import type {
  Tip,
  TipWithAuthor,
  CreateTipPayload,
  UpdateTipPayload,
  TipStatus,
  TipFilters,
  PaginatedResponse,
} from '@/types/database';

/**
 * Create a new tip
 */
export async function createTip(authorId: string, payload: CreateTipPayload): Promise<Tip> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('tips')
    .insert({
      author_id: authorId,
      title: payload.title,
      body: payload.body,
      tags: payload.tags || [],
      images: payload.images || [],
      status: 'pending',
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Error creating tip:', error);
    throw new Error(`Failed to create tip: ${error?.message || 'Unknown error'}`);
  }

  return data;
}

/**
 * Get a tip by ID
 */
export async function getTipById(tipId: string): Promise<Tip | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('tips')
    .select('*')
    .eq('id', tipId)
    .single();

  if (error) {
    console.error('Error fetching tip:', error);
    return null;
  }

  return data;
}

/**
 * Get a tip with author information
 */
export async function getTipWithAuthor(tipId: string): Promise<TipWithAuthor | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('tips')
    .select(`
      *,
      author:profiles!tips_author_id_fkey(
        id,
        full_name,
        username,
        avatar_url
      )
    `)
    .eq('id', tipId)
    .single();

  if (error || !data) {
    console.error('Error fetching tip with author:', error);
    return null;
  }

  return data as unknown as TipWithAuthor;
}

/**
 * Get tips with filters and pagination
 */
export async function getTips(
  filters: TipFilters,
  limit = 20,
  offset = 0,
  userProfileId?: string
): Promise<PaginatedResponse<TipWithAuthor>> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('tips')
    .select(`
      *,
      author:profiles!tips_author_id_fkey(
        id,
        full_name,
        username,
        avatar_url
      )
    `, { count: 'exact' });

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  } else {
    // Default to approved tips only (for public viewing)
    query = query.eq('status', 'approved');
  }

  if (filters.author_id) {
    query = query.eq('author_id', filters.author_id);
  }

  if (filters.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  // Pagination and ordering
  query = query
    .order('helpful_count', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching tips:', error);
    throw new Error(`Failed to fetch tips: ${error.message}`);
  }

  let tips = (data || []) as unknown as TipWithAuthor[];

  // If user is logged in, check which tips they've voted as helpful
  if (userProfileId && tips.length > 0) {
    const tipIds = tips.map(t => t.id);
    const { data: votes } = await supabase
      .from('tip_votes')
      .select('tip_id')
      .eq('user_id', userProfileId)
      .in('tip_id', tipIds);

    const votedTipIds = new Set(votes?.map(v => v.tip_id) || []);
    tips = tips.map(tip => ({
      ...tip,
      is_voted: votedTipIds.has(tip.id),
    }));
  }

  return {
    data: tips,
    pagination: {
      total: count || 0,
      limit,
      offset,
      has_more: (count || 0) > offset + limit,
    },
  };
}

/**
 * Update a tip (author can update pending tips)
 */
export async function updateTip(
  tipId: string,
  authorId: string,
  updates: UpdateTipPayload
): Promise<Tip> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('tips')
    .update(updates)
    .eq('id', tipId)
    .eq('author_id', authorId) // Ensure author
    .eq('status', 'pending') // Only pending tips can be edited
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating tip:', error);
    throw new Error(`Failed to update tip: ${error?.message || 'Not found, unauthorized, or not pending'}`);
  }

  return data;
}

/**
 * Update tip status (admin only - use service role client)
 */
export async function updateTipStatus(tipId: string, status: TipStatus): Promise<Tip> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('tips')
    .update({ status })
    .eq('id', tipId)
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating tip status:', error);
    throw new Error(`Failed to update tip status: ${error?.message || 'Not found'}`);
  }

  return data;
}

/**
 * Delete a tip (author can delete pending tips)
 */
export async function deleteTip(tipId: string, authorId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('tips')
    .delete()
    .eq('id', tipId)
    .eq('author_id', authorId)
    .eq('status', 'pending'); // Only pending tips can be deleted

  if (error) {
    console.error('Error deleting tip:', error);
    throw new Error(`Failed to delete tip: ${error.message}`);
  }

  return true;
}

/**
 * Vote tip as helpful
 */
export async function voteTipHelpful(userId: string, tipId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  // Check if already voted
  const { data: existing } = await supabase
    .from('tip_votes')
    .select('tip_id')
    .eq('user_id', userId)
    .eq('tip_id', tipId)
    .single();

  if (existing) {
    // Already voted
    return false;
  }

  // Add vote
  const { error: voteError } = await supabase
    .from('tip_votes')
    .insert({
      user_id: userId,
      tip_id: tipId,
    });

  if (voteError) {
    console.error('Error adding vote:', voteError);
    throw new Error(`Failed to vote: ${voteError.message}`);
  }

  // Increment helpful count
  const { error: incrementError } = await supabase
    .from('tips')
    .update({
      helpful_count: supabase.rpc('increment', { row_id: tipId }),
    })
    .eq('id', tipId);

  if (incrementError) {
    console.error('Error incrementing helpful count:', incrementError);
    // Don't throw - vote was recorded
  }

  return true;
}

/**
 * Check if user has voted a tip as helpful
 */
export async function hasVotedTip(userId: string, tipId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('tip_votes')
    .select('tip_id')
    .eq('user_id', userId)
    .eq('tip_id', tipId)
    .single();

  return !!data && !error;
}

/**
 * Get tips by tag
 */
export async function getTipsByTag(tag: string, limit = 20): Promise<TipWithAuthor[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('tips')
    .select(`
      *,
      author:profiles!tips_author_id_fkey(
        id,
        full_name,
        username,
        avatar_url
      )
    `)
    .eq('status', 'approved')
    .contains('tags', [tag])
    .order('helpful_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching tips by tag:', error);
    throw new Error(`Failed to fetch tips: ${error.message}`);
  }

  return (data || []) as unknown as TipWithAuthor[];
}

