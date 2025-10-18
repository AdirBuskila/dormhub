// Marketplace Search API
// POST: Advanced search for listings

import { NextRequest, NextResponse } from 'next/server';
import { getListings } from '@/lib/db/listings';
import { searchQuerySchema } from '@/lib/validators';
import type { ApiResponse } from '@/types/database';

/**
 * POST /api/marketplace/search
 * Advanced search for listings
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate body
    const body = await request.json();
    const { query, limit } = searchQuerySchema.parse(body);

    // Search listings
    const result = await getListings(
      {
        search: query,
        status: 'active',
      },
      limit,
      0
    );

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in POST /api/marketplace/search:', error);

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
    };

    return NextResponse.json(response, { status: 400 });
  }
}

