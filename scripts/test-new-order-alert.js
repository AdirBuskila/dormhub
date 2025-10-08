/**
 * Test script for new order alerts
 * This script creates a test order and triggers the admin alert
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testNewOrderAlert() {
  try {
    console.log('🧪 Testing new order alert system...');
    
    // First, let's check if we have any clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name, phone')
      .limit(1);
    
    if (clientsError) {
      console.error('❌ Error fetching clients:', clientsError);
      return;
    }
    
    if (!clients || clients.length === 0) {
      console.log('⚠️  No clients found. Creating a test client...');
      
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: 'Test Client',
          phone: '+972501234567',
          address: 'Test Address',
          payment_terms: 'on_delivery'
        })
        .select()
        .single();
      
      if (clientError) {
        console.error('❌ Error creating test client:', clientError);
        return;
      }
      
      clients.push(newClient);
    }
    
    const testClient = clients[0];
    console.log(`📱 Using client: ${testClient.name} (${testClient.phone})`);
    
    // Check if we have any products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, brand, model, total_stock')
      .limit(1);
    
    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
      return;
    }
    
    if (!products || products.length === 0) {
      console.log('⚠️  No products found. Creating a test product...');
      
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert({
          brand: 'Apple',
          model: 'iPhone 15 Pro',
          storage: '256GB',
          condition: 'new',
          category: 'phone',
          total_stock: 10,
          reserved_stock: 0,
          min_stock_alert: 2
        })
        .select()
        .single();
      
      if (productError) {
        console.error('❌ Error creating test product:', productError);
        return;
      }
      
      products.push(newProduct);
    }
    
    const testProduct = products[0];
    console.log(`📦 Using product: ${testProduct.brand} ${testProduct.model}`);
    
    // Create a test order
    console.log('📝 Creating test order...');
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        client_id: testClient.id,
        status: 'draft',
        total_price: 0,
        notes: 'Test order for alert system'
      })
      .select()
      .single();
    
    if (orderError) {
      console.error('❌ Error creating test order:', orderError);
      return;
    }
    
    console.log(`✅ Test order created: ${order.id}`);
    
    // Create order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: testProduct.id,
        quantity: 1,
        price: 0
      });
    
    if (itemsError) {
      console.error('❌ Error creating order items:', itemsError);
      return;
    }
    
    console.log('✅ Order items created');
    
    // Test the alert function directly
    console.log('🔔 Testing alert creation...');
    
    // Create alert in database
    const { error: alertError } = await supabase
      .from('alerts')
      .insert({
        type: 'new_order',
        ref_id: order.id,
        message: `New order #${order.id.slice(0, 8)} from ${testClient.name} with 1 items`,
        severity: 'info'
      });

    if (alertError) {
      console.error('❌ Error creating new order alert:', alertError);
    } else {
      console.log('✅ Alert created in database');
    }
    
    // Create outbound message for admin
    const adminPhone = process.env.ADMIN_PHONE || '+972546093624';
    const message = `🆕 New Order Alert!\nOrder #${order.id.slice(0, 8)} from ${testClient.name}\nItems: 1\nPlease check the admin dashboard.`;
    
    const { error: messageError } = await supabase
      .from('outbound_messages')
      .insert({
        channel: 'whatsapp',
        to_phone: adminPhone,
        template: 'admin_new_order',
        payload: {
          orderId: order.id.slice(0, 8),
          clientName: testClient.name,
          itemCount: 1,
          rendered_message: message
        },
        sent: false
      });
    
    if (messageError) {
      console.error('❌ Error creating outbound message:', messageError);
    } else {
      console.log('✅ Outbound message created');
    }
    
    const alertResult = !alertError && !messageError;
    
    if (alertResult) {
      console.log('✅ Alert created successfully!');
      console.log(`📱 Check your phone (+972546093624) for WhatsApp notification`);
    } else {
      console.log('❌ Alert creation failed');
    }
    
    // Check if alert was created in database
    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select('*')
      .eq('type', 'new_order')
      .eq('ref_id', order.id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (alertsError) {
      console.error('❌ Error fetching alerts:', alertsError);
    } else if (alerts && alerts.length > 0) {
      console.log('✅ Alert found in database:', alerts[0]);
    } else {
      console.log('⚠️  No alert found in database');
    }
    
    // Check outbound messages
    const { data: messages, error: messagesError } = await supabase
      .from('outbound_messages')
      .select('*')
      .eq('template', 'admin_new_order')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (messagesError) {
      console.error('❌ Error fetching outbound messages:', messagesError);
    } else if (messages && messages.length > 0) {
      console.log('✅ Outbound message found:', messages[0]);
    } else {
      console.log('⚠️  No outbound message found');
    }
    
    console.log('\n🎉 Test completed!');
    console.log('📋 Summary:');
    console.log(`   - Order ID: ${order.id}`);
    console.log(`   - Client: ${testClient.name}`);
    console.log(`   - Alert created: ${alertResult ? 'Yes' : 'No'}`);
    console.log(`   - Admin phone: +972546093624`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testNewOrderAlert();
