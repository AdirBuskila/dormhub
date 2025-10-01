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

async function checkOrderItemsTable() {
  try {
    console.log('🔄 Checking order_items table structure...');
    
    // Try to query the table structure
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .limit(0); // Just to test if table exists
    
    if (error) {
      console.error('❌ Error accessing order_items table:', error.message);
      console.log('\n🔧 This suggests the table might not exist or has RLS issues.');
      
      // Try to check if table exists by attempting to insert a test record
      console.log('\n🧪 Testing table creation...');
      const testInsert = await supabase
        .from('order_items')
        .insert({
          order_id: '00000000-0000-0000-0000-000000000000',
          product_id: '00000000-0000-0000-0000-000000000000',
          quantity: 1,
          price: 0
        });
      
      console.log('Test insert result:', testInsert);
      
      return;
    }
    
    console.log('✅ order_items table exists and is accessible');
    
    // Get table info
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'order_items' });
    
    if (columnsError) {
      console.log('⚠️  Could not get column info, but table exists');
    } else {
      console.log('📋 Table columns:', columns);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkOrderItemsTable();
