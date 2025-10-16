import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { CreateConsignmentData } from '@/types/database';

// GET all consignments
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const status = searchParams.get('status');
    const productId = searchParams.get('product_id');

    let query = supabaseAdmin
      .from('consignments')
      .select(`
        id,
        product_id,
        client_id,
        serial_number,
        imei,
        condition,
        consigned_date,
        expected_price,
        status,
        notes,
        created_at,
        updated_at,
        sold_date,
        sold_price,
        product:products(
          id,
          brand,
          model,
          storage,
          category,
          image_url
        ),
        client:clients(
          id,
          name,
          phone,
          shop_name
        )
      `);

    // Apply filters
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query.order('consigned_date', { ascending: false });

    if (error) {
      console.error('Error fetching consignments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch consignments' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Consignments GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new consignment
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CreateConsignmentData = await request.json();

    // Validate required fields
    if (!body.product_id || !body.condition) {
      return NextResponse.json(
        { error: 'Missing required fields: product_id, condition' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('consignments')
      .insert({
        product_id: body.product_id,
        client_id: body.client_id || null,
        serial_number: body.serial_number || null,
        imei: body.imei || null,
        condition: body.condition,
        expected_price: body.expected_price || null,
        notes: body.notes || null,
        status: 'pending', // Default status
      })
      .select(`
        id,
        product_id,
        client_id,
        serial_number,
        imei,
        condition,
        consigned_date,
        expected_price,
        status,
        notes,
        created_at,
        updated_at,
        sold_date,
        sold_price,
        product:products(
          id,
          brand,
          model,
          storage,
          category,
          image_url
        ),
        client:clients(
          id,
          name,
          phone,
          shop_name
        )
      `)
      .single();

    if (error) {
      console.error('Error creating consignment:', error);
      return NextResponse.json(
        { error: 'Failed to create consignment' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Consignments POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update consignment
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Consignment ID is required' },
        { status: 400 }
      );
    }

    // If status is being changed to 'sold', set sold_date
    if (updates.status === 'sold' && !updates.sold_date) {
      updates.sold_date = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('consignments')
      .update(updates)
      .eq('id', id)
      .select(`
        id,
        product_id,
        client_id,
        serial_number,
        imei,
        condition,
        consigned_date,
        expected_price,
        status,
        notes,
        created_at,
        updated_at,
        sold_date,
        sold_price,
        product:products(
          id,
          brand,
          model,
          storage,
          category,
          image_url
        ),
        client:clients(
          id,
          name,
          phone,
          shop_name
        )
      `)
      .single();

    if (error) {
      console.error('Error updating consignment:', error);
      return NextResponse.json(
        { error: 'Failed to update consignment' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Consignments PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete consignment
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Consignment ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('consignments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting consignment:', error);
      return NextResponse.json(
        { error: 'Failed to delete consignment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Consignments DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
