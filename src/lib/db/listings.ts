// Listing database operations

import { getSupabaseClient } from '../supabase';
import type {
  Listing,
  ListingWithOwner,
  CreateListingPayload,
  UpdateListingPayload,
  ListingFilters,
  PaginatedResponse,
} from '@/types/database';

/**
 * Create a new listing
 */
export async function createListing(ownerId: string, payload: CreateListingPayload): Promise<Listing> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('listings')
    .insert({
      owner_id: ownerId,
      ...payload,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Error creating listing:', error);
    throw new Error(`Failed to create listing: ${error?.message || 'Unknown error'}`);
  }

  return data;
}

/**
 * Get a listing by ID
 */
export async function getListingById(listingId: string): Promise<Listing | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .single();

  if (error) {
    console.error('Error fetching listing:', error);
    return null;
  }

  return data;
}

/**
 * Get a listing with owner information
 */
export async function getListingWithOwner(listingId: string): Promise<ListingWithOwner | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      owner:profiles!listings_owner_id_fkey(
        id,
        full_name,
        username,
        room,
        avatar_url
      )
    `)
    .eq('id', listingId)
    .single();

  if (error || !data) {
    console.error('Error fetching listing with owner:', error);
    return null;
  }

  return data as unknown as ListingWithOwner;
}

/**
 * Get listings with filters and pagination
 */
export async function getListings(
  filters: ListingFilters,
  limit = 20,
  offset = 0
): Promise<PaginatedResponse<ListingWithOwner>> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('listings')
    .select(`
      *,
      owner:profiles!listings_owner_id_fkey(
        id,
        full_name,
        username,
        room,
        avatar_url
      )
    `, { count: 'exact' });

  // Apply filters
  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  } else {
    // Default to active listings
    query = query.eq('status', 'active');
  }

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.condition) {
    query = query.eq('condition', filters.condition);
  }

  if (filters.owner_id) {
    query = query.eq('owner_id', filters.owner_id);
  }

  if (filters.min_price !== undefined) {
    query = query.gte('price_ils', filters.min_price);
  }

  if (filters.max_price !== undefined) {
    query = query.lte('price_ils', filters.max_price);
  }

  if (filters.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  // Full-text search
  if (filters.search) {
    query = query.textSearch('title', filters.search, {
      type: 'websearch',
      config: 'simple',
    });
  }

  // Pagination and ordering
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching listings:', error);
    throw new Error(`Failed to fetch listings: ${error.message}`);
  }

  return {
    data: (data || []) as unknown as ListingWithOwner[],
    pagination: {
      total: count || 0,
      limit,
      offset,
      has_more: (count || 0) > offset + limit,
    },
  };
}

/**
 * Update a listing
 */
export async function updateListing(
  listingId: string,
  ownerId: string,
  updates: UpdateListingPayload
): Promise<Listing> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('listings')
    .update(updates)
    .eq('id', listingId)
    .eq('owner_id', ownerId) // Ensure owner
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating listing:', error);
    throw new Error(`Failed to update listing: ${error?.message || 'Not found or unauthorized'}`);
  }

  return data;
}

/**
 * Delete a listing
 */
export async function deleteListing(listingId: string, ownerId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)
    .eq('owner_id', ownerId); // Ensure owner

  if (error) {
    console.error('Error deleting listing:', error);
    throw new Error(`Failed to delete listing: ${error.message}`);
  }

  return true;
}

/**
 * Increment view count
 */
export async function incrementViewCount(listingId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.rpc('increment_listing_views', {
    listing_id: listingId,
  });

  if (error) {
    // Log but don't throw - view counting is non-critical
    console.error('Error incrementing view count:', error);
  }
}

/**
 * Get user's favorites
 */
export async function getUserFavorites(userId: string, limit = 50): Promise<ListingWithOwner[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      listing:listings(
        *,
        owner:profiles!listings_owner_id_fkey(
          id,
          full_name,
          username,
          room,
          avatar_url
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching favorites:', error);
    throw new Error(`Failed to fetch favorites: ${error.message}`);
  }

  // Extract listings from the nested structure
  return (data || [])
    .map((item: { listing: ListingWithOwner }) => item.listing)
    .filter(Boolean) as ListingWithOwner[];
}

/**
 * Check if user has favorited a listing
 */
export async function isFavorited(userId: string, listingId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('favorites')
    .select('listing_id')
    .eq('user_id', userId)
    .eq('listing_id', listingId)
    .single();

  return !!data && !error;
}

/**
 * Toggle favorite (add or remove)
 */
export async function toggleFavorite(userId: string, listingId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('listing_id')
    .eq('user_id', userId)
    .eq('listing_id', listingId)
    .single();

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('listing_id', listingId);

    if (error) {
      console.error('Error removing favorite:', error);
      throw new Error(`Failed to remove favorite: ${error.message}`);
    }

    return false; // Removed
  } else {
    // Add favorite
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        listing_id: listingId,
      });

    if (error) {
      console.error('Error adding favorite:', error);
      throw new Error(`Failed to add favorite: ${error.message}`);
    }

    return true; // Added
  }
}

