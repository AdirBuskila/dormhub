/**
 * Update Product Images Script
 * 
 * This script scans the /public/images/products/ directory and updates
 * the database with image URLs for each product.
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Path to products images directory
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'products');

/**
 * Normalize folder name to match product name patterns
 */
function normalizeName(folderName) {
  return folderName
    .replace(/_/g, ' ')           // Replace underscores with spaces
    .replace(/\s+/g, ' ')          // Normalize multiple spaces
    .trim();
}

/**
 * Get the first image from a folder
 */
function getFirstImage(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );
    
    if (imageFiles.length > 0) {
      return imageFiles[0];
    }
    return null;
  } catch (error) {
    console.error(`Error reading folder ${folderPath}:`, error.message);
    return null;
  }
}

/**
 * Main function to update product images
 */
async function updateProductImages() {
  console.log('🚀 Starting product image update...\n');

  try {
    // Get all product folders
    const folders = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`📁 Found ${folders.length} product folders\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process each folder
    for (const folderName of folders) {
      const folderPath = path.join(IMAGES_DIR, folderName);
      const firstImage = getFirstImage(folderPath);

      if (!firstImage) {
        console.log(`⚠️  ${folderName} - No images found, skipping`);
        skippedCount++;
        continue;
      }

      // Create image URL (relative to /public)
      const imageUrl = `/images/products/${folderName}/${firstImage}`;

      // Normalize folder name for matching
      const normalizedName = normalizeName(folderName);

      // Try to find matching products in database
      // Match by model name (most specific)
      const { data: products, error } = await supabase
        .from('products')
        .select('id, brand, model, image_url')
        .ilike('model', `%${normalizedName}%`);

      if (error) {
        console.error(`❌ ${folderName} - Database error:`, error.message);
        errorCount++;
        continue;
      }

      if (!products || products.length === 0) {
        console.log(`⚠️  ${folderName} - No matching products found`);
        skippedCount++;
        continue;
      }

      // Update all matching products
      for (const product of products) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: imageUrl })
          .eq('id', product.id);

        if (updateError) {
          console.error(`❌ ${product.brand} ${product.model} - Update failed:`, updateError.message);
          errorCount++;
        } else {
          console.log(`✅ ${product.brand} ${product.model} → ${imageUrl}`);
          updatedCount++;
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Update Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Updated: ${updatedCount} products`);
    console.log(`⚠️  Skipped: ${skippedCount} folders`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('='.repeat(60));

    // Show products still without images
    const { data: productsWithoutImages } = await supabase
      .from('products')
      .select('brand, model')
      .is('image_url', null);

    if (productsWithoutImages && productsWithoutImages.length > 0) {
      console.log(`\n⚠️  ${productsWithoutImages.length} products still without images:`);
      productsWithoutImages.forEach(p => {
        console.log(`   - ${p.brand} ${p.model}`);
      });
    } else {
      console.log('\n🎉 All products now have images!');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
console.log('🖼️  Product Image Updater');
console.log('='.repeat(60) + '\n');

updateProductImages()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

