import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { CreateDealData } from '@/types/database';

// Cache deals for 2 minutes
export const revalidate = 120; // 2 minutes

// GET /api/deals - Get all deals (with optional filters)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const productId = searchParams.get('product_id');
    
    let query = supabaseAdmin
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
          total_stock
        )
      `)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    if (productId) {
      query = query.eq('product_id', productId);
    }
    
    const { data: deals, error } = await query;
    
    if (error) {
      console.error('Error fetching deals:', error);
      return NextResponse.json(
        { error: 'Failed to fetch deals' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { deals },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240',
        },
      }
    );
  } catch (error) {
    console.error('Error in GET /api/deals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/deals - Create new deal
export async function POST(request: Request) {
  try {
    const body: CreateDealData = await request.json();
    
    // Validate required fields
    if (!body.title || !body.product_id || !body.tier_1_price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Insert deal
    const { data: deal, error } = await supabaseAdmin
      .from('deals')
      .insert({
        title: body.title,
        description: body.description || null,
        product_id: body.product_id,
        priority: body.priority || 0,
        
        tier_1_qty: body.tier_1_qty || 1,
        tier_1_price: body.tier_1_price,
        tier_2_qty: body.tier_2_qty || null,
        tier_2_price: body.tier_2_price || null,
        tier_3_qty: body.tier_3_qty || null,
        tier_3_price: body.tier_3_price || null,
        
        expiration_type: body.expiration_type || 'none',
        expires_at: body.expires_at || null,
        max_quantity: body.max_quantity || null,
        sold_quantity: 0,
        
        payment_methods: body.payment_methods || ['cash'],
        payment_surcharge_check_month: body.payment_surcharge_check_month || 0,
        payment_surcharge_check_week: body.payment_surcharge_check_week || 0,
        payment_notes: body.payment_notes || null,
        
        allowed_colors: body.allowed_colors || null,
        required_importer: body.required_importer || null,
        is_esim: body.is_esim || null,
        additional_specs: body.additional_specs || null,
        
        notes: body.notes || null,
        internal_notes: body.internal_notes || null,
        
        is_active: true,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating deal:', error);
      return NextResponse.json(
        { error: 'Failed to create deal' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ deal }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/deals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

