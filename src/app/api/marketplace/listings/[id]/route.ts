// Marketplace Listing Detail API
// GET: Get a specific listing
// PATCH: Update a listing (owner only)
// DELETE: Delete a listing (owner only)

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getOptionalUser } from '@/lib/auth';
import {
  getListingWithOwner,
  updateListing,
  deleteListing,
  incrementViewCount,
} from '@/lib/db/listings';
import { updateListingSchema } from '@/lib/validators';
import type { ApiResponse, ListingWithOwner } from '@/types/database';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/marketplace/listings/[id]
 * Get a specific listing with owner info
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Get listing
    const listing = await getListingWithOwner(id);

    if (!listing) {
      const response: ApiResponse = {
        success: false,
        error: 'Listing not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Increment view count (fire and forget)
    incrementViewCount(id).catch(console.error);

    const response: ApiResponse<ListingWithOwner> = {
      success: true,
      data: listing,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/marketplace/listings/[id]:', error);

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch listing',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * PATCH /api/marketplace/listings/[id]
 * Update a listing (owner only)
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Require authentication
    const user = await getCurrentUser();

    // Parse and validate body
    const body = await request.json();
    const validatedData = updateListingSchema.parse(body);

    // Update listing (will check ownership)
    const updated = await updateListing(id, user.profileId, validatedData);

    const response: ApiResponse<typeof updated> = {
      success: true,
      data: updated,
      message: 'Listing updated successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in PATCH /api/marketplace/listings/[id]:', error);

    if (error instanceof Error && error.message === 'User not authenticated') {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required',
      };
      return NextResponse.json(response, { status: 401 });
    }

    if (error instanceof Error && error.message.includes('Not found or unauthorized')) {
      const response: ApiResponse = {
        success: false,
        error: 'Listing not found or you are not the owner',
      };
      return NextResponse.json(response, { status: 403 });
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update listing',
    };

    return NextResponse.json(response, { status: 400 });
  }
}

/**
 * DELETE /api/marketplace/listings/[id]
 * Delete a listing (owner only)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Require authentication
    const user = await getCurrentUser();

    // Delete listing (will check ownership)
    await deleteListing(id, user.profileId);

    const response: ApiResponse = {
      success: true,
      message: 'Listing deleted successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in DELETE /api/marketplace/listings/[id]:', error);

    if (error instanceof Error && error.message === 'User not authenticated') {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required',
      };
      return NextResponse.json(response, { status: 401 });
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete listing',
    };

    return NextResponse.json(response, { status: 403 });
  }
}

