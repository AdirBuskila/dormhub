const fs = require('fs');
const path = require('path');

// Read the products JSON file
const productsPath = path.join(__dirname, '..', 'data', 'products.json');
const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log('📦 Product Database Verification');
console.log('================================');

console.log(`\n📊 Total Products: ${productsData.length}`);

// Count by category
const categoryCount = productsData.reduce((acc, product) => {
  acc[product.category] = (acc[product.category] || 0) + 1;
  return acc;
}, {});

console.log('\n📱 Products by Category:');
Object.entries(categoryCount).forEach(([category, count]) => {
  console.log(`  ${category}: ${count} products`);
});

// Count by brand
const brandCount = productsData.reduce((acc, product) => {
  acc[product.brand] = (acc[product.brand] || 0) + 1;
  return acc;
}, {});

console.log('\n🏷️ Products by Brand:');
Object.entries(brandCount)
  .sort(([,a], [,b]) => b - a)
  .forEach(([brand, count]) => {
    console.log(`  ${brand}: ${count} products`);
  });

// Show some examples
console.log('\n📋 Sample Products:');
productsData.slice(0, 10).forEach((product, index) => {
  console.log(`  ${index + 1}. ${product.brand} ${product.model} (${product.storage}) - ${product.category}`);
});

console.log(`\n... and ${productsData.length - 10} more products`);

console.log('\n✅ Ready to add all products to your inventory!');
