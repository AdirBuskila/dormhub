// Marketplace Favorites API
// GET: Get user's favorites
// POST: Toggle favorite

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserFavorites, toggleFavorite } from '@/lib/db/listings';
import { toggleFavoriteSchema } from '@/lib/validators';
import type { ApiResponse } from '@/types/database';

/**
 * GET /api/marketplace/favorites
 * Get current user's favorites
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await getCurrentUser();

    // Get favorites
    const favorites = await getUserFavorites(user.profileId);

    const response: ApiResponse<typeof favorites> = {
      success: true,
      data: favorites,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/marketplace/favorites:', error);

    if (error instanceof Error && error.message === 'User not authenticated') {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required',
      };
      return NextResponse.json(response, { status: 401 });
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch favorites',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/marketplace/favorites
 * Toggle favorite (add or remove)
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await getCurrentUser();

    // Parse and validate body
    const body = await request.json();
    const { listing_id } = toggleFavoriteSchema.parse(body);

    // Toggle favorite
    const added = await toggleFavorite(user.profileId, listing_id);

    const response: ApiResponse<{ favorited: boolean }> = {
      success: true,
      data: { favorited: added },
      message: added ? 'Added to favorites' : 'Removed from favorites',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in POST /api/marketplace/favorites:', error);

    if (error instanceof Error && error.message === 'User not authenticated') {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required',
      };
      return NextResponse.json(response, { status: 401 });
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle favorite',
    };

    return NextResponse.json(response, { status: 400 });
  }
}

