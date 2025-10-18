// DormHub Database Types
// Generated TypeScript types matching the Supabase schema

export type UUID = string;

// ============================================================================
// ENUMS
// ============================================================================

export type ListingType = 'sell' | 'buy' | 'swap' | 'giveaway';
export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';
export type ListingStatus = 'active' | 'reserved' | 'sold' | 'removed';
export type TipStatus = 'pending' | 'approved' | 'rejected';

// ============================================================================
// DATABASE TABLES
// ============================================================================

export interface Profile {
  id: UUID;
  clerk_id: string;
  full_name?: string | null;
  username?: string | null;
  room?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: UUID;
  owner_id: UUID;
  type: ListingType;
  title: string;
  description?: string | null;
  price_ils?: number | null;
  condition?: ListingCondition | null;
  category?: string | null;
  tags: string[];
  images: string[];
  status: ListingStatus;
  location?: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  user_id: UUID;
  listing_id: UUID;
  created_at: string;
}

export interface Tip {
  id: UUID;
  author_id?: UUID | null;
  title: string;
  body: string;
  tags: string[];
  helpful_count: number;
  status: TipStatus;
  created_at: string;
  updated_at: string;
}

export interface TipVote {
  user_id: UUID;
  tip_id: UUID;
  created_at: string;
}

export interface InfoPage {
  id: UUID;
  slug: string;
  title: string;
  body_md: string;
  author_id?: UUID | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// API PAYLOADS (for creation/updates)
// ============================================================================

export interface CreateListingPayload {
  type: ListingType;
  title: string;
  description?: string;
  price_ils?: number;
  condition?: ListingCondition;
  category?: string;
  tags?: string[];
  images?: string[];
  location?: string;
}

export interface UpdateListingPayload {
  title?: string;
  description?: string;
  price_ils?: number;
  condition?: ListingCondition;
  category?: string;
  tags?: string[];
  images?: string[];
  status?: ListingStatus;
  location?: string;
}

export interface CreateTipPayload {
  title: string;
  body: string;
  tags?: string[];
}

export interface UpdateTipPayload {
  title?: string;
  body?: string;
  tags?: string[];
}

export interface ApproveTipPayload {
  status: 'approved' | 'rejected';
}

// ============================================================================
// EXTENDED TYPES (with joins)
// ============================================================================

export interface ListingWithOwner extends Listing {
  owner: Pick<Profile, 'id' | 'full_name' | 'username' | 'room' | 'avatar_url'>;
}

export interface TipWithAuthor extends Tip {
  author?: Pick<Profile, 'id' | 'full_name' | 'username' | 'avatar_url'> | null;
}

export interface ListingWithFavorite extends Listing {
  is_favorited: boolean;
}

// ============================================================================
// PAGINATION & FILTERING
// ============================================================================

export interface PaginationParams {
  limit?: number;
  cursor?: string; // ID for cursor-based pagination
  offset?: number; // Alternative: offset-based pagination
}

export interface ListingFilters {
  type?: ListingType;
  status?: ListingStatus;
  category?: string;
  min_price?: number;
  max_price?: number;
  condition?: ListingCondition;
  tags?: string[];
  search?: string;
  owner_id?: UUID;
}

export interface TipFilters {
  status?: TipStatus;
  tags?: string[];
  author_id?: UUID;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface CurrentUser {
  clerkId: string;
  profileId: UUID;
  fullName?: string | null;
  username?: string | null;
  email?: string;
  isAdmin: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const LISTING_TYPES: readonly ListingType[] = ['sell', 'buy', 'swap', 'giveaway'] as const;
export const LISTING_CONDITIONS: readonly ListingCondition[] = ['new', 'like_new', 'good', 'fair', 'poor'] as const;
export const LISTING_STATUSES: readonly ListingStatus[] = ['active', 'reserved', 'sold', 'removed'] as const;
export const TIP_STATUSES: readonly TipStatus[] = ['pending', 'approved', 'rejected'] as const;

// Categories (can be extended)
export const LISTING_CATEGORIES = [
  'electronics',
  'furniture',
  'appliances',
  'books',
  'study-gear',
  'clothing',
  'kitchen',
  'sports',
  'misc',
] as const;

export type ListingCategory = typeof LISTING_CATEGORIES[number];
