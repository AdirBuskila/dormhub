const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkProducts() {
  try {
    console.log('🔍 Checking database connection and products table...');
    console.log('Supabase URL:', supabaseUrl);
    
    // First, let's check if we can connect to the database
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Database error:', error.message);
      console.error('Full error:', error);
      return;
    }
    
    console.log('✅ Database connection successful!');
    console.log(`📦 Found ${data ? data.length : 0} products`);
    
    if (data && data.length > 0) {
      console.log('\n📋 Sample products:');
      data.forEach((product, index) => {
        console.log(`${index + 1}. ${product.brand} ${product.model} ${product.storage} - Stock: ${product.stock || 'N/A'}`);
      });
    } else {
      console.log('⚠️  No products found. You may need to run the seed script first.');
    }
    
  } catch (error) {
    console.error('❌ Error checking products:', error.message);
  }
}

// Run the script
checkProducts();
