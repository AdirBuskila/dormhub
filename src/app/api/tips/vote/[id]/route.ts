// Tips Vote API
// POST: Vote a tip as helpful

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { voteTipHelpful } from '@/lib/db/tips';
import type { ApiResponse } from '@/types/database';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/tips/vote/[id]
 * Vote a tip as helpful (requires authentication)
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Require authentication
    const user = await getCurrentUser();

    // Vote tip as helpful
    const voted = await voteTipHelpful(user.profileId, id);

    if (!voted) {
      const response: ApiResponse = {
        success: false,
        error: 'You have already voted this tip as helpful',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Vote recorded successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in POST /api/tips/vote/[id]:', error);

    if (error instanceof Error && error.message === 'User not authenticated') {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required',
      };
      return NextResponse.json(response, { status: 401 });
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to vote',
    };

    return NextResponse.json(response, { status: 400 });
  }
}

