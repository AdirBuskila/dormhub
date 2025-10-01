import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    console.log('Orders API - userId:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { clientId, items } = await request.json();
    console.log('Orders API - clientId:', clientId, 'items:', items);

    if (!clientId || !items || items.length === 0) {
      console.log('Orders API - Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify client exists and belongs to the authenticated user
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('clerk_user_id', userId)
      .single();

    console.log('Orders API - client lookup result:', { client, clientError });

    if (clientError || !client) {
      console.log('Orders API - Client not found or error:', clientError);
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Validate all products exist and have stock
    const productIds = items.map((item: { productId: string }) => item.productId);
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, total_stock')
      .in('id', productIds);

    if (productsError) {
      return NextResponse.json(
        { error: 'Failed to validate products' },
        { status: 500 }
      );
    }

    // Check stock availability
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }
      if (product.total_stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${item.productId}` },
          { status: 400 }
        );
      }
    }

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        client_id: clientId,
        status: 'draft',
        total_price: 0, // Will be calculated when admin sets prices
        notes: null
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map((item: { productId: string; quantity: number; price?: number }) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price || 0
    }));

    console.log('Orders API - Creating order items:', orderItems);

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.log('Orders API - Order items creation failed:', itemsError);
      
      // Clean up the order if items creation fails
      await supabaseAdmin
        .from('orders')
        .delete()
        .eq('id', order.id);

      return NextResponse.json(
        { error: `Failed to create order items: ${itemsError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
