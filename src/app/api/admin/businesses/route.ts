// Admin Businesses API
// GET: Get all businesses (including inactive)
// POST: Create a new business
// PATCH: Update business owner

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';
import type { ApiResponse } from '@/types/database';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/businesses
 * Get all businesses for admin management
 */
export async function GET() {
  try {
    // Require admin access
    await requireAdmin();

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        business_hours (*),
        student_discounts (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch businesses');
    }

    const response: ApiResponse = {
      success: true,
      data: data || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/admin/businesses:', error);

    if (error instanceof Error && error.message === 'Admin access required') {
      const response: ApiResponse = {
        success: false,
        error: 'Admin access required',
      };
      return NextResponse.json(response, { status: 403 });
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch businesses',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

const createBusinessSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['restaurant', 'minimarket', 'bakery', 'supermarket', 'other']),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  is_active: z.boolean().optional(),
  owner_clerk_id: z.string().optional(),
});

/**
 * POST /api/admin/businesses
 * Create a new business
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin access
    await requireAdmin();

    const body = await request.json();
    const businessData = createBusinessSchema.parse(body);

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('businesses')
      .insert(businessData)
      .select()
      .single();

    if (error || !data) {
      throw new Error('Failed to create business');
    }

    const response: ApiResponse = {
      success: true,
      data,
      message: 'Business created successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in POST /api/admin/businesses:', error);

    if (error instanceof Error && error.message === 'Admin access required') {
      const response: ApiResponse = {
        success: false,
        error: 'Admin access required',
      };
      return NextResponse.json(response, { status: 403 });
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create business',
    };

    return NextResponse.json(response, { status: 400 });
  }
}

const updateBusinessOwnerSchema = z.object({
  businessId: z.string().uuid(),
  ownerClerkId: z.string().nullable(),
});

/**
 * PATCH /api/admin/businesses
 * Update business owner
 */
export async function PATCH(request: NextRequest) {
  try {
    // Require admin access
    await requireAdmin();

    const body = await request.json();
    const { businessId, ownerClerkId } = updateBusinessOwnerSchema.parse(body);

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('businesses')
      .update({ owner_clerk_id: ownerClerkId })
      .eq('id', businessId)
      .select()
      .single();

    if (error || !data) {
      throw new Error('Failed to update business owner');
    }

    const response: ApiResponse = {
      success: true,
      data,
      message: ownerClerkId 
        ? 'Business owner assigned successfully' 
        : 'Business owner removed successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in PATCH /api/admin/businesses:', error);

    if (error instanceof Error && error.message === 'Admin access required') {
      const response: ApiResponse = {
        success: false,
        error: 'Admin access required',
      };
      return NextResponse.json(response, { status: 403 });
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update business owner',
    };

    return NextResponse.json(response, { status: 400 });
  }
}

