const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkSchema() {
  try {
    console.log('🔍 Checking products table schema...');
    
    // Query the table schema using a direct SQL query
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        ORDER BY ordinal_position;
      `
    });
    
    if (error) {
      // If the RPC doesn't exist, try a different approach
      console.log('RPC not available, trying alternative method...');
      
      // Just get one product to see the actual structure
      const { data: sample, error: sampleError } = await supabase
        .from('products')
        .select('*')
        .limit(1)
        .single();
      
      if (sampleError) {
        console.error('❌ Error getting sample product:', sampleError.message);
        return;
      }
      
      console.log('✅ Sample product structure:');
      console.log(JSON.stringify(sample, null, 2));
      
    } else {
      console.log('📋 Products table schema:');
      console.log('─'.repeat(80));
      data.forEach(col => {
        console.log(`${col.column_name.padEnd(20)} | ${col.data_type.padEnd(15)} | Nullable: ${col.is_nullable} | Default: ${col.column_default || 'None'}`);
      });
      console.log('─'.repeat(80));
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  }
}

// Run the script
checkSchema();
