import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

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

    let query = supabaseAdmin
      .from('consignments')
      .select(`
        id,
        client_id,
        product_id,
        quantity,
        notes,
        created_at,
        updated_at,
        product:products(brand, model, storage, image_url),
        client:clients(name)
      `);

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

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

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { client_id, product_id, quantity, notes } = body;

    if (!client_id || !product_id || quantity === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: client_id, product_id, quantity' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('consignments')
      .insert({
        client_id,
        product_id,
        quantity,
        notes: notes || null,
      })
      .select(`
        id,
        client_id,
        product_id,
        quantity,
        notes,
        created_at,
        updated_at,
        product:products(brand, model, storage, image_url),
        client:clients(name)
      `)
      .single();

    if (error) {
      console.error('Error creating consignment:', error);
      return NextResponse.json(
        { error: 'Failed to create consignment' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Consignments POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
