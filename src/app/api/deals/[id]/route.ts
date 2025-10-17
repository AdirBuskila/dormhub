import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { CreateDealData } from '@/types/database';

type UpdateDealData = Partial<CreateDealData> & { is_active?: boolean; sold_quantity?: number };

// GET /api/deals/:id - Get single deal
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: deal, error } = await supabaseAdmin
      .from('deals')
      .select(`
        *,
        product:products(
          id,
          brand,
          model,
          storage,
          category,
          image_url,
          total_stock,
          sale_price_default
        )
      `)
      .eq('id', params.id)
      .single();
    
    if (error || !deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ deal });
  } catch (error) {
    console.error('Error in GET /api/deals/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/deals/:id - Update deal
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body: UpdateDealData = await request.json();
    
    // Build update object (only include provided fields)
    const updateData: any = {};
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.product_id !== undefined) updateData.product_id = body.product_id;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    
    if (body.tier_1_qty !== undefined) updateData.tier_1_qty = body.tier_1_qty;
    if (body.tier_1_price !== undefined) updateData.tier_1_price = body.tier_1_price;
    if (body.tier_2_qty !== undefined) updateData.tier_2_qty = body.tier_2_qty;
    if (body.tier_2_price !== undefined) updateData.tier_2_price = body.tier_2_price;
    if (body.tier_3_qty !== undefined) updateData.tier_3_qty = body.tier_3_qty;
    if (body.tier_3_price !== undefined) updateData.tier_3_price = body.tier_3_price;
    
    if (body.expiration_type !== undefined) updateData.expiration_type = body.expiration_type;
    if (body.expires_at !== undefined) updateData.expires_at = body.expires_at;
    if (body.max_quantity !== undefined) updateData.max_quantity = body.max_quantity;
    if (body.sold_quantity !== undefined) updateData.sold_quantity = body.sold_quantity;
    
    if (body.payment_methods !== undefined) updateData.payment_methods = body.payment_methods;
    if (body.payment_surcharge_check_month !== undefined) {
      updateData.payment_surcharge_check_month = body.payment_surcharge_check_month;
    }
    if (body.payment_surcharge_check_week !== undefined) {
      updateData.payment_surcharge_check_week = body.payment_surcharge_check_week;
    }
    if (body.payment_notes !== undefined) updateData.payment_notes = body.payment_notes;
    
    if (body.allowed_colors !== undefined) updateData.allowed_colors = body.allowed_colors;
    if (body.required_importer !== undefined) updateData.required_importer = body.required_importer;
    if (body.is_esim !== undefined) updateData.is_esim = body.is_esim;
    if (body.additional_specs !== undefined) updateData.additional_specs = body.additional_specs;
    
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.internal_notes !== undefined) updateData.internal_notes = body.internal_notes;
    
    const { data: deal, error } = await supabaseAdmin
      .from('deals')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating deal:', error);
      return NextResponse.json(
        { error: 'Failed to update deal' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ deal });
  } catch (error) {
    console.error('Error in PATCH /api/deals/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/deals/:id - Delete deal
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from('deals')
      .delete()
      .eq('id', params.id);
    
    if (error) {
      console.error('Error deleting deal:', error);
      return NextResponse.json(
        { error: 'Failed to delete deal' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/deals/:id:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

