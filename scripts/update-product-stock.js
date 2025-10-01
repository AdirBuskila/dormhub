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

async function updateProductStock() {
  try {
    console.log('🔄 Fetching all products...');
    
    // Get all products
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, brand, model, storage, total_stock');
    
    if (fetchError) {
      throw new Error(`Failed to fetch products: ${fetchError.message}`);
    }
    
    if (!products || products.length === 0) {
      console.log('⚠️  No products found in database');
      return;
    }
    
    console.log(`📦 Found ${products.length} products`);
    
    // Update all products to have 100 stock
    const { data: updatedProducts, error: updateError } = await supabase
      .from('products')
      .update({ total_stock: 100 })
      .neq('id', '00000000-0000-0000-0000-000000000000') // This will match all products since no product has this ID
      .select('id, brand, model, storage, total_stock');
    
    if (updateError) {
      throw new Error(`Failed to update products: ${updateError.message}`);
    }
    
    console.log('✅ Successfully updated all products!');
    console.log('\n📋 Updated Products:');
    console.log('─'.repeat(80));
    
    updatedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.brand} ${product.model} ${product.storage} - Stock: ${product.total_stock}`);
    });
    
    console.log('─'.repeat(80));
    console.log(`🎉 Updated ${updatedProducts.length} products to 100 stock each`);
    
  } catch (error) {
    console.error('❌ Error updating product stock:', error.message);
    process.exit(1);
  }
}

// Run the script
updateProductStock();
