// Marketplace Listings API
// GET: List listings with filters
// POST: Create a new listing

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getOptionalUser } from '@/lib/auth';
import { getListings, createListing } from '@/lib/db/listings';
import { createListingSchema, listingFiltersSchema } from '@/lib/validators';
import type { ApiResponse, ListingWithOwner } from '@/types/database';

/**
 * GET /api/marketplace/listings
 * List listings with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters = {
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
      category: searchParams.get('category') || undefined,
      min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
      max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
      condition: searchParams.get('condition') || undefined,
      tags: searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined,
      search: searchParams.get('search') || undefined,
      owner_id: searchParams.get('owner_id') || undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
      offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
    };

    // Validate filters
    const validatedFilters = listingFiltersSchema.parse(filters);

    // Get listings
    const result = await getListings(validatedFilters, validatedFilters.limit, validatedFilters.offset);

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/marketplace/listings:', error);

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch listings',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/marketplace/listings
 * Create a new listing (requires authentication)
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await getCurrentUser();

    // Parse and validate body
    const body = await request.json();
    const validatedData = createListingSchema.parse(body);

    // Create listing
    const listing = await createListing(user.profileId, validatedData);

    const response: ApiResponse<ListingWithOwner> = {
      success: true,
      data: listing as unknown as ListingWithOwner,
      message: 'Listing created successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/marketplace/listings:', error);

    if (error instanceof Error && error.message === 'User not authenticated') {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required',
      };
      return NextResponse.json(response, { status: 401 });
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create listing',
    };

    return NextResponse.json(response, { status: 400 });
  }
}

