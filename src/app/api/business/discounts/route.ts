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

// POST - Create new discount
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { businessId, ...discountData } = body;

    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 });
    }

    // Verify ownership
    const { authorized } = await verifyBusinessOwnership(businessId, userId);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Insert the discount
    const { data: discount, error } = await supabaseAdmin
      .from('student_discounts')
      .insert({
        business_id: businessId,
        title: discountData.title,
        description: discountData.description,
        discount_type: discountData.discount_type,
        discount_value: discountData.discount_value,
        terms: discountData.terms,
        valid_days: discountData.valid_days,
        valid_from: discountData.valid_from,
        valid_until: discountData.valid_until,
        requires_student_id: discountData.requires_student_id ?? true,
        is_active: discountData.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating discount:', error);
      return NextResponse.json({ error: 'Failed to create discount' }, { status: 500 });
    }

    return NextResponse.json({ discount });
  } catch (error) {
    console.error('Create discount error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update discount
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessId, discount } = await request.json();

    if (!businessId || !discount || !discount.id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify ownership
    const { authorized } = await verifyBusinessOwnership(businessId, userId);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the discount
    const { error } = await supabaseAdmin
      .from('student_discounts')
      .update({
        title: discount.title,
        description: discount.description,
        discount_type: discount.discount_type,
        discount_value: discount.discount_value,
        terms: discount.terms,
        valid_days: discount.valid_days,
        valid_from: discount.valid_from,
        valid_until: discount.valid_until,
        requires_student_id: discount.requires_student_id,
        is_active: discount.is_active,
      })
      .eq('id', discount.id)
      .eq('business_id', businessId);

    if (error) {
      console.error('Error updating discount:', error);
      return NextResponse.json({ error: 'Failed to update discount' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update discount error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete discount
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessId, discountId } = await request.json();

    if (!businessId || !discountId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify ownership
    const { authorized } = await verifyBusinessOwnership(businessId, userId);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the discount
    const { error } = await supabaseAdmin
      .from('student_discounts')
      .delete()
      .eq('id', discountId)
      .eq('business_id', businessId);

    if (error) {
      console.error('Error deleting discount:', error);
      return NextResponse.json({ error: 'Failed to delete discount' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete discount error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

