// Tips Approval API
// PATCH: Approve or reject a tip (admin only)

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { updateTipStatus } from '@/lib/db/tips';
import { approveTipSchema } from '@/lib/validators';
import type { ApiResponse, Tip } from '@/types/database';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/tips/approve/[id]
 * Approve or reject a tip (admin only)
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Require admin access
    await requireAdmin();

    // Parse and validate body
    const body = await request.json();
    const { status } = approveTipSchema.parse(body);

    // Update tip status
    const updated = await updateTipStatus(id, status);

    const response: ApiResponse<Tip> = {
      success: true,
      data: updated,
      message: `Tip ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in PATCH /api/tips/approve/[id]:', error);

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
      error: error instanceof Error ? error.message : 'Failed to update tip',
    };

    return NextResponse.json(response, { status: 400 });
  }
}

