import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessId, hours } = await request.json();

    if (!businessId || !hours) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the business belongs to this user
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .eq('owner_clerk_id', userId)
      .single();

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found or unauthorized' }, { status: 403 });
    }

    // Delete existing hours
    await supabaseAdmin
      .from('business_hours')
      .delete()
      .eq('business_id', businessId);

    // Insert new hours
    const hoursToInsert = hours
      .filter((h: any) => h.opens_at || h.closes_at || h.is_closed)
      .map((h: any) => ({
        business_id: businessId,
        day_of_week: h.day_of_week,
        opens_at: h.is_closed ? null : h.opens_at,
        closes_at: h.is_closed ? null : h.closes_at,
        is_closed: h.is_closed || false,
        notes: h.notes || null,
      }));

    if (hoursToInsert.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('business_hours')
        .insert(hoursToInsert);

      if (insertError) {
        console.error('Error inserting hours:', insertError);
        return NextResponse.json({ error: 'Failed to save hours' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Business hours update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

