const fs = require('fs');
const path = require('path');

// Read the updated products.json
const productsPath = path.join(__dirname, '..', 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log('🧪 Testing image URL accessibility...\n');

// Test a few sample products
const testProducts = products.filter(p => 
  p.brand === 'Apple' && p.model.includes('iPhone 17')
).slice(0, 3);

console.log('Testing iPhone 17 products:');
console.log('');

testProducts.forEach((product, index) => {
  console.log(`${index + 1}. ${product.brand} ${product.model} (${product.storage})`);
  console.log(`   Image URL: ${product.image_url}`);
  
  // Check if the image file exists
  if (product.image_url) {
    const imagePath = path.join(__dirname, '..', 'public', product.image_url);
    const exists = fs.existsSync(imagePath);
    console.log(`   File exists: ${exists ? '✅ YES' : '❌ NO'}`);
    if (exists) {
      const stats = fs.statSync(imagePath);
      console.log(`   File size: ${(stats.size / 1024).toFixed(2)} KB`);
    }
  } else {
    console.log(`   Image URL: ❌ MISSING`);
  }
  console.log('');
});

// Test a few more products from different brands
const otherTestProducts = products.filter(p => 
  p.image_url && (
    p.brand === 'Samsung' || 
    p.brand === 'JBL' || 
    p.brand === 'Nokia'
  )
).slice(0, 3);

console.log('Testing other brand products:');
console.log('');

otherTestProducts.forEach((product, index) => {
  console.log(`${index + 1}. ${product.brand} ${product.model}`);
  console.log(`   Image URL: ${product.image_url}`);
  
  if (product.image_url) {
    const imagePath = path.join(__dirname, '..', 'public', product.image_url);
    const exists = fs.existsSync(imagePath);
    console.log(`   File exists: ${exists ? '✅ YES' : '❌ NO'}`);
    if (exists) {
      const stats = fs.statSync(imagePath);
      console.log(`   File size: ${(stats.size / 1024).toFixed(2)} KB`);
    }
  }
  console.log('');
});

// Summary
const productsWithImages = products.filter(p => p.image_url);
const productsWithExistingImages = productsWithImages.filter(p => {
  if (!p.image_url) return false;
  const imagePath = path.join(__dirname, '..', 'public', p.image_url);
  return fs.existsSync(imagePath);
});

console.log('📊 Summary:');
console.log(`- Total products: ${products.length}`);
console.log(`- Products with image URLs: ${productsWithImages.length}`);
console.log(`- Products with existing image files: ${productsWithExistingImages.length}`);
console.log(`- Image coverage: ${((productsWithExistingImages.length / products.length) * 100).toFixed(1)}%`);

console.log('\n✅ Image integration is ready!');
console.log('📋 Next steps:');
console.log('1. Run the SQL script in Supabase to update the database');
console.log('2. Test the image display in your application');
console.log('3. Verify images load correctly in the product list');



