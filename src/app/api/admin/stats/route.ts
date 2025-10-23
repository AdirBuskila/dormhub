// Admin Statistics API
// GET: Get dashboard statistics (users, businesses, hot deals, events)

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import type { ApiResponse } from '@/types/database';

interface AdminStats {
  usersCount: number;
  businessesCount: number;
  hotDealsCount: number;
  eventsCount: number;
  pendingTipsCount: number;
  activeListingsCount: number;
}

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics (requires admin authentication)
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await getCurrentUser();
    
    // Check if user is admin (you can add more sophisticated admin check here)
    // For now, we'll just check if user is authenticated
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'Unauthorized',
      };
      return NextResponse.json(response, { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Fetch all counts in parallel
    const [
      { count: usersCount },
      { count: businessesCount },
      { count: hotDealsCount },
      { count: eventsCount },
      { count: pendingTipsCount },
      { count: activeListingsCount },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('businesses').select('*', { count: 'exact', head: true }),
      supabase.from('hot_deals').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('dorm_events').select('*', { count: 'exact', head: true }).eq('is_cancelled', false),
      supabase.from('tips').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'available'),
    ]);

    const stats: AdminStats = {
      usersCount: usersCount || 0,
      businessesCount: businessesCount || 0,
      hotDealsCount: hotDealsCount || 0,
      eventsCount: eventsCount || 0,
      pendingTipsCount: pendingTipsCount || 0,
      activeListingsCount: activeListingsCount || 0,
    };

    const response: ApiResponse<AdminStats> = {
      success: true,
      data: stats,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/admin/stats:', error);

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch statistics',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

