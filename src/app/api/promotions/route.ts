import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Promotion, CreatePromotionData } from '@/types/database';

// GET all promotions or active promotions only
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const productId = searchParams.get('product_id');

    let query = supabaseAdmin
      .from('promotions')
      .select(`
        *,
        product:products (
          id,
          brand,
          model,
          storage,
          category,
          image_url,
          sale_price_default
        )
      `)
      .order('starts_at', { ascending: false });

    // Filter by product_id if provided
    if (productId) {
      query = query.eq('product_id', productId);
    }

    // Filter active promotions
    if (activeOnly) {
      const now = new Date().toISOString();
      query = query
        .eq('active', true)
        .lte('starts_at', now)
        .gte('ends_at', now);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching promotions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch promotions' },
        { status: 500 }
      );
    }

    // Add computed status field
    const promotionsWithStatus = data?.map(promo => {
      const now = new Date();
      const startsAt = new Date(promo.starts_at);
      const endsAt = new Date(promo.ends_at);
      
      let status: 'active' | 'scheduled' | 'expired' | 'inactive';
      
      if (!promo.active) {
        status = 'inactive';
      } else if (now < startsAt) {
        status = 'scheduled';
      } else if (now > endsAt) {
        status = 'expired';
      } else {
        status = 'active';
      }

      const hasUnitsAvailable = !promo.max_units || promo.units_sold < promo.max_units;
      const unitsRemaining = promo.max_units ? promo.max_units - promo.units_sold : null;

      return {
        ...promo,
        status,
        has_units_available: hasUnitsAvailable,
        units_remaining: unitsRemaining
      };
    }) || [];

    return NextResponse.json(promotionsWithStatus);
  } catch (error) {
    console.error('Error in GET /api/promotions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new promotion
export async function POST(request: NextRequest) {
  try {
    const body: CreatePromotionData = await request.json();

    // Validate required fields
    if (!body.product_id || !body.title || !body.promo_price || !body.starts_at || !body.ends_at) {
      return NextResponse.json(
        { error: 'Missing required fields: product_id, title, promo_price, starts_at, ends_at' },
        { status: 400 }
      );
    }

    // Validate dates
    const startsAt = new Date(body.starts_at);
    const endsAt = new Date(body.ends_at);
    
    if (endsAt <= startsAt) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Get product to set original_price if not provided
    if (!body.original_price) {
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('sale_price_default')
        .eq('id', body.product_id)
        .single();
      
      if (product) {
        body.original_price = product.sale_price_default;
      }
    }

    // Create promotion
    const { data, error } = await supabaseAdmin
      .from('promotions')
      .insert({
        product_id: body.product_id,
        title: body.title,
        title_he: body.title_he,
        description: body.description,
        description_he: body.description_he,
        promo_price: body.promo_price,
        original_price: body.original_price,
        starts_at: body.starts_at,
        ends_at: body.ends_at,
        max_units: body.max_units,
        active: body.active !== undefined ? body.active : true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating promotion:', error);
      return NextResponse.json(
        { error: 'Failed to create promotion' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/promotions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update promotion
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Promotion ID is required' },
        { status: 400 }
      );
    }

    // Validate dates if both are provided
    if (updates.starts_at && updates.ends_at) {
      const startsAt = new Date(updates.starts_at);
      const endsAt = new Date(updates.ends_at);
      
      if (endsAt <= startsAt) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from('promotions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating promotion:', error);
      return NextResponse.json(
        { error: 'Failed to update promotion' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH /api/promotions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete promotion
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Promotion ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('promotions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting promotion:', error);
      return NextResponse.json(
        { error: 'Failed to delete promotion' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/promotions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

