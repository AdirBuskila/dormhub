const fs = require('fs');
const path = require('path');

// Read the updated products.json
const productsPath = path.join(__dirname, '..', 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log('🚀 Generating comprehensive database update script...\n');

// Filter products that have image URLs
const productsWithImages = products.filter(p => 
  p.image_url && p.image_url.startsWith('/images/products/')
);

console.log(`Found ${productsWithImages.length} products with images out of ${products.length} total products`);

// Generate SQL update statements
const sqlUpdates = productsWithImages.map(product => {
  return `UPDATE products SET image_url = '${product.image_url}' WHERE brand = '${product.brand}' AND model = '${product.model}' AND storage = '${product.storage}';`;
});

// Create the complete SQL script
const sqlScript = `-- Update all products with image URLs
-- Generated on ${new Date().toISOString()}
-- Total products to update: ${productsWithImages.length}

${sqlUpdates.join('\n')}

-- Verify the updates
SELECT brand, model, storage, image_url 
FROM products 
WHERE image_url LIKE '/images/products/%' 
ORDER BY brand, model, storage;
`;

// Write the SQL script
const sqlPath = path.join(__dirname, '..', 'database', 'update_all_product_images.sql');
fs.writeFileSync(sqlPath, sqlScript);

console.log(`✅ Generated SQL script: ${sqlPath}`);
console.log(`📊 Summary:`);
console.log(`- Products with images: ${productsWithImages.length}`);
console.log(`- Products without images: ${products.length - productsWithImages.length}`);

// Show some examples
console.log(`\n📋 Sample updates:`);
productsWithImages.slice(0, 5).forEach(product => {
  console.log(`- ${product.brand} ${product.model} (${product.storage}) -> ${product.image_url}`);
});

console.log(`\n📋 Next steps:`);
console.log(`1. Copy the SQL from: ${sqlPath}`);
console.log(`2. Run it in your Supabase SQL editor`);
console.log(`3. Test the image display in your application`);

// Also create a batch update script for better performance
const batchSqlScript = `-- Batch update all products with image URLs (more efficient)
-- Generated on ${new Date().toISOString()}

-- Create a temporary table with the updates
CREATE TEMP TABLE product_image_updates (
  brand TEXT,
  model TEXT,
  storage TEXT,
  image_url TEXT
);

-- Insert all the image updates
INSERT INTO product_image_updates (brand, model, storage, image_url) VALUES
${productsWithImages.map(p => `('${p.brand}', '${p.model}', '${p.storage}', '${p.image_url}')`).join(',\n')};

-- Update products using the temporary table
UPDATE products 
SET image_url = p.image_url
FROM product_image_updates p
WHERE products.brand = p.brand 
  AND products.model = p.model 
  AND products.storage = p.storage;

-- Verify the updates
SELECT brand, model, storage, image_url 
FROM products 
WHERE image_url LIKE '/images/products/%' 
ORDER BY brand, model, storage
LIMIT 20;

-- Clean up
DROP TABLE product_image_updates;
`;

const batchSqlPath = path.join(__dirname, '..', 'database', 'batch_update_product_images.sql');
fs.writeFileSync(batchSqlPath, batchSqlScript);

console.log(`\n⚡ Also created batch update script: ${batchSqlPath}`);
console.log(`   (This is more efficient for large updates)`);



