const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Please add your Supabase URL and API key to .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedProducts() {
  try {
    console.log('🚀 Starting product seeding...');
    
    // Read products from JSON file
    const productsPath = path.join(__dirname, '..', 'data', 'products.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    
    console.log(`📦 Found ${productsData.length} products to insert`);
    
    // Insert products in batches of 50 to avoid rate limits
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < productsData.length; i += batchSize) {
      const batch = productsData.slice(i, i + batchSize);
      
      console.log(`📤 Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(productsData.length / batchSize)} (${batch.length} products)`);
      
      const { data, error } = await supabase
        .from('products')
        .insert(batch)
        .select();
      
      if (error) {
        console.error('❌ Error inserting batch:', error);
        throw error;
      }
      
      insertedCount += data.length;
      console.log(`✅ Inserted ${data.length} products (Total: ${insertedCount})`);
      
      // Small delay between batches to be nice to the API
      if (i + batchSize < productsData.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`🎉 Successfully seeded ${insertedCount} products!`);
    
    // Show summary by category
    const { data: summary } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null);
    
    if (summary) {
      const categoryCount = summary.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📊 Products by category:');
      Object.entries(categoryCount).forEach(([category, count]) => {
        console.log(`  ${category}: ${count} products`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

// Run the seeding
seedProducts();
