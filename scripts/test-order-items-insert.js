require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Supabase environment variables are not set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testOrderItemsInsert() {
  try {
    console.log('🔄 Testing order_items insert...');
    
    // First, let's create a test order
    console.log('📝 Creating test order...');
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        client_id: '7bed41ec-df74-47ce-bf16-a76d96615c27', // Use one of the existing client IDs
        status: 'draft',
        total_price: 0,
        notes: null
      })
      .select()
      .single();
    
    if (orderError) {
      console.error('❌ Failed to create test order:', orderError);
      return;
    }
    
    console.log('✅ Test order created:', order.id);
    
    // Get a product ID
    console.log('📦 Getting a product ID...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (productsError || !products || products.length === 0) {
      console.error('❌ Failed to get product:', productsError);
      return;
    }
    
    const productId = products[0].id;
    console.log('✅ Got product ID:', productId);
    
    // Now try to insert order items
    console.log('🛒 Testing order_items insert...');
    const orderItems = [{
      order_id: order.id,
      product_id: productId,
      quantity: 1,
      price: 0
    }];
    
    console.log('Inserting:', orderItems);
    
    const { data: insertedItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();
    
    if (itemsError) {
      console.error('❌ Failed to insert order items:', itemsError);
      console.error('Full error details:', JSON.stringify(itemsError, null, 2));
    } else {
      console.log('✅ Successfully inserted order items:', insertedItems);
    }
    
    // Clean up - delete the test order
    console.log('🧹 Cleaning up test order...');
    await supabase
      .from('orders')
      .delete()
      .eq('id', order.id);
    
    console.log('✅ Test completed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testOrderItemsInsert();
