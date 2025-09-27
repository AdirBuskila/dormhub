const fs = require('fs');
const path = require('path');

// Read the products JSON file
const productsPath = path.join(__dirname, '..', 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Image URL mapping based on brand and category
const imageUrls = {
  'Apple': {
    'phone': 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop',
    'tablet': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
    'earphones': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop',
    'accessories': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop'
  },
  'Samsung': {
    'phone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
    'tablet': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
    'earphones': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop',
    'accessories': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop'
  },
  'Xiaomi': {
    'phone': 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=400&fit=crop',
    'tablet': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
    'earphones': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop',
    'accessories': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop'
  },
  'JBL': {
    'earphones': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop'
  },
  'Phone Line': {
    'phone': 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=400&fit=crop'
  },
  'Nokia': {
    'phone': 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=400&fit=crop'
  },
  'Blackview': {
    'phone': 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=400&fit=crop'
  }
};

// Default fallback images
const defaultImages = {
  'phone': 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=400&fit=crop',
  'tablet': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
  'earphones': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop',
  'accessories': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop'
};

// Add image URLs to products
const updatedProducts = products.map(product => {
  const brandImages = imageUrls[product.brand];
  let imageUrl;
  
  if (brandImages && brandImages[product.category]) {
    imageUrl = brandImages[product.category];
  } else {
    imageUrl = defaultImages[product.category] || defaultImages['phone'];
  }
  
  return {
    ...product,
    image_url: imageUrl
  };
});

// Write updated products back to file
fs.writeFileSync(productsPath, JSON.stringify(updatedProducts, null, 2));

console.log('✅ Added image URLs to all products');
console.log(`📊 Updated ${updatedProducts.length} products`);

// Show some examples
console.log('\n📋 Sample products with images:');
updatedProducts.slice(0, 5).forEach((product, index) => {
  console.log(`  ${index + 1}. ${product.brand} ${product.model} - ${product.image_url}`);
});

console.log('\n🎨 Image URL categories:');
Object.entries(defaultImages).forEach(([category, url]) => {
  console.log(`  ${category}: ${url}`);
});
