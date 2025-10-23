import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

// Verify business ownership
async function verifyBusinessOwnership(businessId: string, userId: string) {
  const { data: business, error } = await supabaseAdmin
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('owner_clerk_id', userId)
    .single();

  return { authorized: !error && !!business, error };
}

// GET - Fetch all hot deals for a business
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 });
    }

    // Verify ownership
    const { authorized } = await verifyBusinessOwnership(businessId, userId);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch hot deals
    const { data: hotDeals, error } = await supabaseAdmin
      .from('hot_deals')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching hot deals:', error);
      return NextResponse.json({ error: 'Failed to fetch hot deals' }, { status: 500 });
    }

    return NextResponse.json({ hotDeals });
  } catch (error) {
    console.error('Fetch hot deals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new hot deal
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { businessId, title, description, imageUrl, validFrom, validUntil, isActive } = body;

    if (!businessId || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify ownership
    const { authorized } = await verifyBusinessOwnership(businessId, userId);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check hot deals limit (max 3 per business)
    const { data: existingDeals, error: countError } = await supabaseAdmin
      .from('hot_deals')
      .select('id')
      .eq('business_id', businessId);

    if (countError) {
      console.error('Error checking hot deals count:', countError);
      return NextResponse.json({ error: 'Failed to check hot deals limit' }, { status: 500 });
    }

    if (existingDeals && existingDeals.length >= 3) {
      return NextResponse.json(
        { error: 'Maximum limit reached. Each business can have up to 3 hot deals.' },
        { status: 400 }
      );
    }

    // Insert the hot deal
    const { data: hotDeal, error } = await supabaseAdmin
      .from('hot_deals')
      .insert({
        business_id: businessId,
        title,
        description,
        image_url: imageUrl,
        valid_from: validFrom || new Date().toISOString(),
        valid_until: validUntil,
        is_active: isActive ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating hot deal:', error);
      return NextResponse.json({ error: 'Failed to create hot deal' }, { status: 500 });
    }

    return NextResponse.json({ hotDeal });
  } catch (error) {
    console.error('Create hot deal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update hot deal
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { businessId, hotDealId, title, description, imageUrl, validFrom, validUntil, isActive } = body;

    if (!businessId || !hotDealId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify ownership
    const { authorized } = await verifyBusinessOwnership(businessId, userId);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the hot deal
    const { data: hotDeal, error } = await supabaseAdmin
      .from('hot_deals')
      .update({
        title,
        description,
        image_url: imageUrl,
        valid_from: validFrom,
        valid_until: validUntil,
        is_active: isActive,
      })
      .eq('id', hotDealId)
      .eq('business_id', businessId)
      .select()
      .single();

    if (error) {
      console.error('Error updating hot deal:', error);
      return NextResponse.json({ error: 'Failed to update hot deal' }, { status: 500 });
    }

    return NextResponse.json({ hotDeal });
  } catch (error) {
    console.error('Update hot deal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete hot deal
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { businessId, hotDealId } = body;

    if (!businessId || !hotDealId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify ownership
    const { authorized } = await verifyBusinessOwnership(businessId, userId);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the hot deal
    const { error } = await supabaseAdmin
      .from('hot_deals')
      .delete()
      .eq('id', hotDealId)
      .eq('business_id', businessId);

    if (error) {
      console.error('Error deleting hot deal:', error);
      return NextResponse.json({ error: 'Failed to delete hot deal' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete hot deal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

