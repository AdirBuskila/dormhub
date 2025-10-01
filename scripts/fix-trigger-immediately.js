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

async function fixTriggerImmediately() {
  try {
    console.log('🚨 URGENT: Fixing order_items trigger issue...');
    
    // First, let's see what triggers exist
    console.log('📋 Checking existing triggers on order_items...');
    
    // Try to drop ALL possible triggers on order_items
    const dropTriggersSQL = `
-- Drop all possible problematic triggers
DROP TRIGGER IF EXISTS update_updated_at_on_order_items ON order_items;
DROP TRIGGER IF EXISTS update_updated_at_column ON order_items;
DROP TRIGGER IF EXISTS order_items_updated_at_trigger ON order_items;

-- Check what triggers remain
SELECT trigger_name, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'order_items';
    `;
    
    console.log('🔧 Attempting to drop triggers...');
    
    // Try to execute via RPC
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: dropTriggersSQL });
      if (error) {
        console.log('⚠️  RPC method failed, but that\'s expected');
      }
    } catch (e) {
      console.log('⚠️  RPC not available, that\'s okay');
    }
    
    // Alternative approach: Try to insert a test record to see if the trigger is gone
    console.log('🧪 Testing if trigger is fixed...');
    
    // Create a test order first
    const { data: testOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        client_id: '26f9dbc5-deb8-4ad0-bd67-29caca452b2b', // Use existing client
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
    
    console.log('✅ Test order created:', testOrder.id);
    
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
    
    // Try to insert order item
    const { data: insertedItem, error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: testOrder.id,
        product_id: productId,
        quantity: 1,
        price: 0
      })
      .select();
    
    if (itemError) {
      console.error('❌ STILL FAILING:', itemError.message);
      console.log('\n🚨 MANUAL FIX NEEDED:');
      console.log('1. Go to Supabase Dashboard → SQL Editor');
      console.log('2. Run this SQL:');
      console.log('');
      console.log('-- Check what triggers exist');
      console.log('SELECT trigger_name, action_statement FROM information_schema.triggers WHERE event_object_table = \'order_items\';');
      console.log('');
      console.log('-- Drop ALL triggers on order_items');
      console.log('DROP TRIGGER IF EXISTS update_updated_at_on_order_items ON order_items;');
      console.log('DROP TRIGGER IF EXISTS update_updated_at_column ON order_items;');
      console.log('DROP TRIGGER IF EXISTS order_items_updated_at_trigger ON order_items;');
      console.log('');
      console.log('-- Or drop all triggers with a wildcard approach');
      console.log('DO $$');
      console.log('DECLARE');
      console.log('    trigger_record RECORD;');
      console.log('BEGIN');
      console.log('    FOR trigger_record IN');
      console.log('        SELECT trigger_name');
      console.log('        FROM information_schema.triggers');
      console.log('        WHERE event_object_table = \'order_items\'');
      console.log('    LOOP');
      console.log('        EXECUTE \'DROP TRIGGER IF EXISTS \' || trigger_record.trigger_name || \' ON order_items\';');
      console.log('    END LOOP;');
      console.log('END $$;');
    } else {
      console.log('✅ SUCCESS! Trigger is fixed!');
      console.log('✅ Order item inserted:', insertedItem);
    }
    
    // Clean up test order
    await supabase
      .from('orders')
      .delete()
      .eq('id', testOrder.id);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixTriggerImmediately();
