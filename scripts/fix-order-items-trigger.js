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

async function fixOrderItemsTrigger() {
  try {
    console.log('🔄 Checking for problematic triggers on order_items table...');
    
    // SQL to check and fix triggers
    const fixTriggerSQL = `
-- Check if there are any triggers on order_items table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'order_items';

-- Drop any problematic triggers that reference client_id
DROP TRIGGER IF EXISTS update_updated_at_on_order_items ON order_items;

-- Recreate the trigger correctly (without client_id reference)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for order_items (but order_items doesn't have updated_at, so skip)
-- CREATE TRIGGER update_updated_at_on_order_items 
--     BEFORE UPDATE ON order_items 
--     FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    `;

    console.log('📋 Running trigger fix SQL...');
    console.log('⚠️  Note: You may need to run this SQL manually in your Supabase dashboard');
    
    // Try to execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: fixTriggerSQL });
    
    if (error) {
      console.log('⚠️  Could not execute SQL via RPC, but that\'s okay');
      console.log('📋 Please run this SQL manually in your Supabase SQL Editor:');
      console.log('');
      console.log('-- Drop problematic triggers');
      console.log('DROP TRIGGER IF EXISTS update_updated_at_on_order_items ON order_items;');
      console.log('');
      console.log('-- Check for other triggers that might reference client_id');
      console.log('SELECT trigger_name, action_statement FROM information_schema.triggers WHERE event_object_table = \'order_items\';');
      console.log('');
    } else {
      console.log('✅ Trigger fix applied successfully!');
    }
    
    // Test the insert again
    console.log('\n🧪 Testing order_items insert again...');
    await testInsert();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Manual fix needed:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run: DROP TRIGGER IF EXISTS update_updated_at_on_order_items ON order_items;');
    console.log('4. Check for any other triggers on order_items table');
  }
}

async function testInsert() {
  try {
    // Create a test order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        client_id: '7bed41ec-df74-47ce-bf16-a76d96615c27',
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
    
    // Get a product ID
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (productsError || !products || products.length === 0) {
      console.error('❌ Failed to get product:', productsError);
      return;
    }
    
    const productId = products[0].id;
    
    // Try to insert order items
    const orderItems = [{
      order_id: order.id,
      product_id: productId,
      quantity: 1,
      price: 0
    }];
    
    const { data: insertedItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();
    
    if (itemsError) {
      console.error('❌ Still failing to insert order items:', itemsError.message);
    } else {
      console.log('✅ Successfully inserted order items after fix!');
    }
    
    // Clean up
    await supabase
      .from('orders')
      .delete()
      .eq('id', order.id);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

fixOrderItemsTrigger();
