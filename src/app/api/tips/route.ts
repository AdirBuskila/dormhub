// Tips API
// GET: List tips (approved only for public)
// POST: Submit a new tip (requires authentication)

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getOptionalUser } from '@/lib/auth';
import { getTips } from '@/lib/db/tips';
import { tipFiltersSchema } from '@/lib/validators';
import type { ApiResponse } from '@/types/database';

/**
 * GET /api/tips
 * List approved tips (optionally filtered)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters = {
      tags: searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
      offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
    };

    // Validate filters
    const validatedFilters = tipFiltersSchema.parse(filters);

    // Get tips (default to approved only)
    const result = await getTips(
      { ...validatedFilters, status: 'approved' },
      validatedFilters.limit,
      validatedFilters.offset
    );

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/tips:', error);

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tips',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

