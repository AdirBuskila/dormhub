// Tips Submission API
// POST: Submit a new tip (requires authentication)

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createTip } from '@/lib/db/tips';
import { submitTipSchema } from '@/lib/validators';
import type { ApiResponse, Tip } from '@/types/database';

/**
 * POST /api/tips/submit
 * Submit a new tip (requires authentication)
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await getCurrentUser();

    // Parse and validate body
    const body = await request.json();
    const validatedData = submitTipSchema.parse(body);

    // Create tip
    const tip = await createTip(user.profileId, validatedData);

    const response: ApiResponse<Tip> = {
      success: true,
      data: tip,
      message: 'Tip submitted successfully and is pending approval',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/tips/submit:', error);

    if (error instanceof Error && error.message === 'User not authenticated') {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required',
      };
      return NextResponse.json(response, { status: 401 });
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit tip',
    };

    return NextResponse.json(response, { status: 400 });
  }
}

