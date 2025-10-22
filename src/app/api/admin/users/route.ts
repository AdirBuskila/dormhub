// Admin Users API
// GET: Get all users (from Clerk) for assigning business ownership

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { clerkClient } from '@clerk/nextjs/server';
import type { ApiResponse } from '@/types/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/users
 * Get all users for admin management
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin access
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const client = await clerkClient();
    
    // Get users from Clerk
    const { data: users } = await client.users.getUserList({
      limit,
      query: search,
    });

    // Map to simpler format
    const mappedUsers = users.map(user => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      fullName: [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unknown',
      imageUrl: user.imageUrl || '',
    }));

    const response: ApiResponse = {
      success: true,
      data: mappedUsers,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);

    if (error instanceof Error && error.message === 'Admin access required') {
      const response: ApiResponse = {
        success: false,
        error: 'Admin access required',
      };
      return NextResponse.json(response, { status: 403 });
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch users',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

