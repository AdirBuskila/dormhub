// Admin Listings API
// GET: Get all listings for admin review
// PATCH: Update listing status (admin override)

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getListings } from '@/lib/db/listings';
import { getSupabaseClient } from '@/lib/supabase';
import type { ApiResponse, ListingStatus } from '@/types/database';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/listings
 * Get all listings (including removed) for admin review
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin access
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as ListingStatus | null;
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get listings with optional filter
    const result = await getListings(
      { status: status || undefined },
      limit,
      offset
    );

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/admin/listings:', error);

    if (error instanceof Error && error.message === 'Admin access required') {
      const response: ApiResponse = {
        success: false,
        error: 'Admin access required',
      };
      return NextResponse.json(response, { status: 403 });
    }

    if (error instanceof Error && error.message === 'User not authenticated') {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required',
      };
      return NextResponse.json(response, { status: 401 });
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch listings',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

const updateListingSchema = z.object({
  listingId: z.string().uuid(),
  status: z.enum(['active', 'reserved', 'sold', 'removed']),
});

/**
 * PATCH /api/admin/listings
 * Update listing status (admin override)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Require admin access
    await requireAdmin();

    const body = await request.json();
    const { listingId, status } = updateListingSchema.parse(body);

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('listings')
      .update({ status })
      .eq('id', listingId)
      .select()
      .single();

    if (error || !data) {
      throw new Error('Failed to update listing');
    }

    const response: ApiResponse = {
      success: true,
      data,
      message: `Listing status updated to ${status}`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in PATCH /api/admin/listings:', error);

    if (error instanceof Error && error.message === 'Admin access required') {
      const response: ApiResponse = {
        success: false,
        error: 'Admin access required',
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

