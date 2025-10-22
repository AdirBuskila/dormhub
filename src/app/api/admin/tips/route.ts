// Admin Tips API
// GET: Get all tips (including pending) for admin review

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getTips } from '@/lib/db/tips';
import type { ApiResponse, TipWithAuthor, TipStatus } from '@/types/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/tips
 * Get all tips with optional status filter (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin access
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as TipStatus | null;
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get tips with optional filter
    const result = await getTips(
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
    console.error('Error in GET /api/admin/tips:', error);

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
      error: error instanceof Error ? error.message : 'Failed to fetch tips',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

