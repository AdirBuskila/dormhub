import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { updateOrderStatus } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Parse request body first to check for test mode
    const body = await request.json();
    const { clientId, items, testMode, paymentMethod } = body;
    
    // Handle test mode - simulate order creation without DB update
    if (testMode === true) {
      console.log('🧪 TEST MODE: Simulating order creation');
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return fake success response
      return NextResponse.json({ 
        orderId: `test-order-${Date.now()}`,
        message: 'Test order created successfully (not saved to database)',
        testMode: true 
      });
    }
    
    // Get authenticated user
    const { userId } = await auth();
    console.log('Orders API - userId:', userId);
    console.log('Orders API - Environment:', process.env.NODE_ENV);
    console.log('Orders API - Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
    
    if (!userId) {
      console.log('Orders API - No userId found');
      return NextResponse.json({ error: 'Unauthorized - Please sign in to create orders' }, { status: 401 });
    }

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
      .select('id, clerk_user_id')
      .eq('id', clientId)
      .eq('clerk_user_id', userId)
      .single();

    console.log('Orders API - client lookup result:', { 
      clientId, 
      userId, 
      client, 
      clientError: clientError?.message,
      code: clientError?.code
    });

    if (clientError || !client) {
      console.log('Orders API - Client not found or error:', clientError);
      return NextResponse.json(
        { 
          error: 'Client not found or access denied',
          details: clientError?.message || 'Client does not exist or you do not have access',
          clientId,
          userId
        },
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
        notes: null,
        payment_method: paymentMethod || null
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

    // Send WhatsApp order confirmation if client has phone (optional)
    try {
      // Check if WhatsApp service is available
      const { sendWhatsApp } = await import('@/lib/whatsapp');
      
      const { data: clientData } = await supabaseAdmin
        .from('clients')
        .select('phone, name')
        .eq('id', clientId)
        .single();

      if (clientData?.phone) {
        // Get products for summary
        const { data: orderProducts } = await supabaseAdmin
          .from('order_items')
          .select(`
            quantity,
            products!inner(brand, model)
          `)
          .eq('order_id', order.id);

        const summary = orderProducts?.map(item => {
          const product = Array.isArray(item.products) ? item.products[0] : item.products;
          return `${item.quantity}× ${product?.brand || 'Unknown'} ${product?.model || 'Product'}`;
        }).join(', ') || 'Items ordered';

        await sendWhatsApp({
          to: clientData.phone,
          template: 'order_confirmation',
          variables: {
            orderId: order.id.slice(0, 8),
            summary
          },
          toClientId: clientId
        });
      }

      // Send admin notification for new order with product details
      const { createNewOrderAlert } = await import('@/lib/alerts');
      
      // Get product details for the alert
      const itemsSummary = orderProducts?.map(item => {
        const product = Array.isArray(item.products) ? item.products[0] : item.products;
        return `${item.quantity}× ${product?.brand || 'Unknown'} ${product?.model || ''} ${product?.storage || ''}`.trim();
      }).join('\n') || 'No items';
      
      await createNewOrderAlert(
        order.id,
        clientData?.name || 'Unknown Client',
        items.length,
        itemsSummary
      );
    } catch (whatsappError) {
      console.error('Failed to send order confirmation WhatsApp:', whatsappError);
      // Don't fail the order creation if WhatsApp fails
    }

    return NextResponse.json({
      success: true,
      orderId: order.id
    });

  } catch (error) {
    console.error('Order creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { orderId, status } = await request.json();
    console.log('Orders API PATCH - orderId:', orderId, 'status:', status);

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Missing orderId or status' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['draft', 'reserved', 'delivered', 'closed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: draft, reserved, delivered, closed' },
        { status: 400 }
      );
    }

    // Check if order exists and user has access (for admin orders)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, client_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // For customer orders, verify the client belongs to the authenticated user
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('id, clerk_user_id')
      .eq('id', order.client_id)
      .eq('clerk_user_id', userId)
      .single();

    // If client not found or doesn't belong to user, check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
    const { data: userData } = await supabaseAdmin
      .from('clients')
      .select('email')
      .eq('clerk_user_id', userId)
      .single();

    const isAdmin = userData?.email && adminEmails.includes(userData.email.toLowerCase());

    if (clientError && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update order status with stock management
    const updatedOrder = await updateOrderStatus(orderId, status);

    console.log('Orders API PATCH - Order status updated successfully');

    return NextResponse.json({
      success: true,
      order: updatedOrder
    });

  } catch (error) {
    console.error('Order status update error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
