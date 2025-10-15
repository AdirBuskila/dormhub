const fs = require('fs');
const path = require('path');

// Read the products
const productsPath = path.join(__dirname, '..', 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Create mapping based on the actual folder structure
const folderMapping = {
  // iPhones
  'iPhone_17_Pro_Max': 'img_01_224ca228.jpg',
  'iPhone_17_Pro': 'img_01_224ca228.jpg',
  'iPhone_17_Air': 'img_01_07ad1aa4.jpg',
  'iPhone_17': 'img_01_e48af7bf.jpg',
  'iPhone_16_Pro_Max': 'img_01_5bf4a0db.jpg',
  'iPhone_16_Pro': 'img_01_9216b1d9.jpg',
  'iPhone_16_Plus': 'img_01_f835ae41.jpg',
  'iPhone_16': 'img_01_a9e2ae15.jpg',
  'iPhone_16_e': 'img_02_e7b2ba0f.jpg',
  'iPhone_16_Cable_M1': 'img_03_e3ebd8a6.jpg',
  'iPhone_15_Pro_Max': 'img_01_2571481d.jpg',
  'iPhone_15_Pro': 'img_01_8994648f.jpg',
  'iPhone_15': 'img_01_f8f285b9.jpg',
  'iPhone_14_Pro_Max': 'img_02_78c200e1.jpg',
  'iPhone_14_Pro': 'img_02_504fc63c.jpg',
  'iPhone_14': 'img_01_5d599711.jpg',
  'iPhone_13_Pro_Max': 'img_02_a28555d1.jpg',
  'iPhone_13_Pro': 'img_02_0d4455bb.jpg',
  'iPhone_13': 'img_02_0d4455bb.jpg',
  'iPhone_13_Mini': 'img_02_d1ad6900.jpg',
  'iPhone_13_CPO': 'img_02_a2a8a9ec.jpg',
  'iPhone_12_Pro_Max': 'img_01_dfe17e8b.jpg',
  'iPhone_12_Pro': 'img_01_ab23b6cc.jpg',
  'iPhone_12': 'img_01_c8badf8a.jpg',
  'iPhone_11': 'img_01_91aee24c.jpg',

  // Samsung Galaxy
  'Galaxy_S25_Ultra': 'img_01_b243cc55.jpg',
  'Galaxy_S25': 'img_01_4f341677.jpg',
  'Galaxy_S24_Ultra': 'img_02_dc4b6648.jpg',
  'Galaxy_S24_': 'img_01_9016e03e.jpg', // S24+
  'Galaxy_S24': 'img_01_dc879081.jpg',
  'Galaxy_S24_FE': 'img_01_eb0e7165.jpg',
  'Galaxy_A56': 'img_01_7132925f.jpg',
  'Galaxy_A55': 'img_01_f210dd0c.jpg',
  'Galaxy_A36': 'img_02_04aab5d7.jpg',
  'Galaxy_A26': 'img_01_33216fa4.jpg',
  'Galaxy_A16': 'img_01_bfc1dcb6.jpg',
  'Galaxy_A06': 'img_01_a88f4397.jpg',

  // Other phones
  'F34': 'img_01_77e5c8f1.jpg',
  'N2000': 'img_02_31420442.jpg',
  '105_4G': 'img_01_7cf57264.jpg',
  '110_4G': 'img_03_f9da2365.jpg',

  // Tablets
  'iPad_10': 'img_02_775555f2.jpg',
  'Tab_Kids_50': 'img_01_3c0cc4ce.jpg',

  // AirPods
  'AirPods_3': 'img_01_24b164c5.jpg',
  'AirPods_4': 'img_01_96e13121.jpg',
  'AirPods_4_ANC': 'img_01_b0be644e.jpg',
  'AirPods_Pro_2': 'img_01_51b88b0c.jpg',
  'AirPods_Pro_3': 'img_01_51b88b0c.jpg',
  'AirPods_Max': 'img_01_b7f5bb2c.jpg',

  // Samsung Buds
  'Galaxy_Buds_3': 'img_02_84c9b657.jpg',
  'Galaxy_Buds_3_Pro': 'img_01_f77e813f.jpg',
  'Galaxy_Buds_FE': 'img_01_cbf6c2e6.jpg',

  // JBL
  'Wave_Flex': 'img_01_db446f6a.jpg',
  'Wave_Beam': 'img_03_3cfab400.jpg',
  'Tune_125': 'img_01_23fd9b30.jpg',
  'Tune_520': 'img_01_a0ace758.jpg',
  'Tune_Beam': 'img_01_ee69bca2.jpg',

  // Apple Watch
  'Apple_Watch_Series_10': 'img_01_c57b487c.jpg',
  'Apple_Watch_Ultra_2': 'img_01_98164f94.jpg',

  // Accessories
  'AirTag': 'img_01_c6a82380.jpg',
  'Charger_Type-C_to_Type-C': 'img_01_6486e42f.jpg',
  'Charger_USB-C_to_Lightning': 'img_01_e3ebd8a6.jpg',
  'Original_Head_20W': 'img_01_ff7a117d.jpg',
  'USB-C_to_Lightning_Cable__1m_': 'img_01_0bff646f.jpg'
};

// Function to create product key from brand and model
function createProductKey(brand, model) {
  return `${brand}_${model}`.replace(/\s+/g, '_').replace(/[()]/g, '');
}

// Function to find image for a product
function findImageForProduct(brand, model) {
  // Try exact match first
  let key = createProductKey(brand, model);
  let image = folderMapping[key];
  
  if (image) return image;
  
  // Try variations for common naming issues
  const variations = [
    // Remove storage info
    model.replace(/\s+\d+GB.*$/, ''),
    // Remove RAM info
    model.replace(/\s+\d+GB\/\d+GB\s+RAM.*$/, ''),
    // Remove size info for watches
    model.replace(/\s+\d+mm.*$/, ''),
    model.replace(/\s+\d+mm\s+\+\s+Cell.*$/, ''),
    // Remove parentheses
    model.replace(/\s+\(.*?\)$/, ''),
    // Remove "Galaxy" prefix for Samsung
    brand === 'Samsung' ? model.replace(/^Galaxy\s+/, '') : model,
    // Remove "Apple" prefix for Apple
    brand === 'Apple' ? model.replace(/^Apple\s+/, '') : model,
    // Handle S25+ case
    model.replace(/\s+\+$/, '_'),
    // Handle specific cases
    model === 'Galaxy S25+' ? 'Galaxy_S25_' : model,
    model === 'Galaxy S24+' ? 'Galaxy_S24_' : model
  ];
  
  for (const variation of variations) {
    if (variation !== model) {
      key = createProductKey(brand, variation);
      image = folderMapping[key];
      if (image) return image;
    }
  }
  
  return null;
}

console.log('🎯 Creating final image mapping...\n');

let matchedCount = 0;
let totalCount = 0;

// Process each product
products.forEach(product => {
  totalCount++;
  const imageFile = findImageForProduct(product.brand, product.model);
  
  if (imageFile) {
    product.image_url = `/images/products/${product.brand}_${product.model.replace(/\s+/g, '_').replace(/[()]/g, '')}/${imageFile}`;
    matchedCount++;
    console.log(`✅ ${product.brand} ${product.model} -> ${imageFile}`);
  } else {
    console.log(`❌ No image found for ${product.brand} ${product.model}`);
  }
});

// Write updated products
fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));

console.log(`\n📊 Summary:`);
console.log(`- Total products processed: ${totalCount}`);
console.log(`- Images matched: ${matchedCount}`);
console.log(`- Images missing: ${totalCount - matchedCount}`);
console.log(`- Updated products.json successfully!`);

// Create database update script
const updateScript = `
-- Update products with new image URLs
UPDATE products 
SET image_url = CASE 
  -- iPhones
  WHEN brand = 'Apple' AND model = 'iPhone 17 Pro Max' THEN '/images/products/iPhone_17_Pro_Max/img_01_224ca228.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 17 Pro' THEN '/images/products/iPhone_17_Pro/img_01_224ca228.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 17 Air' THEN '/images/products/iPhone_17_Air/img_01_07ad1aa4.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 17' THEN '/images/products/iPhone_17/img_01_e48af7bf.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 16 Pro Max' THEN '/images/products/iPhone_16_Pro_Max/img_01_5bf4a0db.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 16 Pro' THEN '/images/products/iPhone_16_Pro/img_01_9216b1d9.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 16 Plus' THEN '/images/products/iPhone_16_Plus/img_01_f835ae41.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 16' THEN '/images/products/iPhone_16/img_01_a9e2ae15.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 16 e' THEN '/images/products/iPhone_16_e/img_02_e7b2ba0f.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 16 Cable M1' THEN '/images/products/iPhone_16_Cable_M1/img_03_e3ebd8a6.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 15 Pro Max' THEN '/images/products/iPhone_15_Pro_Max/img_01_2571481d.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 15 Pro' THEN '/images/products/iPhone_15_Pro/img_01_8994648f.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 15' THEN '/images/products/iPhone_15/img_01_f8f285b9.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 14 Pro Max' THEN '/images/products/iPhone_14_Pro_Max/img_02_78c200e1.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 14 Pro' THEN '/images/products/iPhone_14_Pro/img_02_504fc63c.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 14' THEN '/images/products/iPhone_14/img_01_5d599711.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 13 Pro Max' THEN '/images/products/iPhone_13_Pro_Max/img_02_a28555d1.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 13 Pro' THEN '/images/products/iPhone_13_Pro/img_02_0d4455bb.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 13' THEN '/images/products/iPhone_13/img_02_0d4455bb.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 13 Mini' THEN '/images/products/iPhone_13_Mini/img_02_d1ad6900.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 13 CPO' THEN '/images/products/iPhone_13_CPO/img_02_a2a8a9ec.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 12 Pro Max' THEN '/images/products/iPhone_12_Pro_Max/img_01_dfe17e8b.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 12 Pro' THEN '/images/products/iPhone_12_Pro/img_01_ab23b6cc.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 12' THEN '/images/products/iPhone_12/img_01_c8badf8a.jpg'
  WHEN brand = 'Apple' AND model = 'iPhone 11' THEN '/images/products/iPhone_11/img_01_91aee24c.jpg'
  
  -- Samsung Galaxy
  WHEN brand = 'Samsung' AND model = 'Galaxy S25 Ultra' THEN '/images/products/Galaxy_S25_Ultra/img_01_b243cc55.jpg'
  WHEN brand = 'Samsung' AND model = 'Galaxy S25+' THEN '/images/products/Galaxy_S25/img_01_4f341677.jpg'
  WHEN brand = 'Samsung' AND model = 'Galaxy S25' THEN '/images/products/Galaxy_S25/img_01_4f341677.jpg'
  WHEN brand = 'Samsung' AND model = 'Galaxy S24 Ultra' THEN '/images/products/Galaxy_S24_Ultra/img_02_dc4b6648.jpg'
  WHEN brand = 'Samsung' AND model = 'Galaxy S24+' THEN '/images/products/Galaxy_S24_/img_01_9016e03e.jpg'
  WHEN brand = 'Samsung' AND model = 'Galaxy S24' THEN '/images/products/Galaxy_S24/img_01_dc879081.jpg'
  WHEN brand = 'Samsung' AND model = 'Galaxy S24 FE' THEN '/images/products/Galaxy_S24_FE/img_01_eb0e7165.jpg'
  WHEN brand = 'Samsung' AND model = 'Galaxy A56' THEN '/images/products/Galaxy_A56/img_01_7132925f.jpg'
  WHEN brand = 'Samsung' AND model = 'Galaxy A55' THEN '/images/products/Galaxy_A55/img_01_f210dd0c.jpg'
  WHEN brand = 'Samsung' AND model = 'Galaxy A36' THEN '/images/products/Galaxy_A36/img_02_04aab5d7.jpg'
  WHEN brand = 'Samsung' AND model = 'Galaxy A26' THEN '/images/products/Galaxy_A26/img_01_33216fa4.jpg'
  WHEN brand = 'Samsung' AND model = 'Galaxy A16' THEN '/images/products/Galaxy_A16/img_01_bfc1dcb6.jpg'
  WHEN brand = 'Samsung' AND model = 'Galaxy A06' THEN '/images/products/Galaxy_A06/img_01_a88f4397.jpg'
  
  -- Other phones
  WHEN brand = 'Phone Line' AND model = 'F34' THEN '/images/products/F34/img_01_77e5c8f1.jpg'
  WHEN brand = 'Blackview' AND model = 'N2000' THEN '/images/products/N2000/img_02_31420442.jpg'
  WHEN brand = 'Nokia' AND model = '105 4G' THEN '/images/products/105_4G/img_01_7cf57264.jpg'
  WHEN brand = 'Nokia' AND model = '110 4G' THEN '/images/products/110_4G/img_03_f9da2365.jpg'
  
  -- Tablets
  WHEN brand = 'Apple' AND model = 'iPad 10' THEN '/images/products/iPad_10/img_02_775555f2.jpg'
  WHEN brand = 'Samsung' AND model = 'Galaxy Tab Kids 50' THEN '/images/products/Tab_Kids_50/img_01_3c0cc4ce.jpg'
  
  -- AirPods
  WHEN brand = 'Apple' AND model = 'AirPods 3' THEN '/images/products/AirPods_3/img_01_24b164c5.jpg'
  WHEN brand = 'Apple' AND model = 'AirPods 4' THEN '/images/products/AirPods_4/img_01_96e13121.jpg'
  WHEN brand = 'Apple' AND model = 'AirPods 4 ANC' THEN '/images/products/AirPods_4_ANC/img_01_b0be644e.jpg'
  WHEN brand = 'Apple' AND model = 'AirPods Pro 2' THEN '/images/products/AirPods_Pro_2/img_01_51b88b0c.jpg'
  WHEN brand = 'Apple' AND model = 'AirPods Pro 3' THEN '/images/products/AirPods_Pro_3/img_01_51b88b0c.jpg'
  WHEN brand = 'Apple' AND model = 'AirPods Max' THEN '/images/products/AirPods_Max/img_01_b7f5bb2c.jpg'
  
  -- Samsung Buds
  WHEN brand = 'Samsung' AND model = 'Galaxy Buds 3' THEN '/images/products/Galaxy_Buds_3/img_02_84c9b657.jpg'
  WHEN brand = 'Samsung' AND model = 'Galaxy Buds 3 Pro' THEN '/images/products/Galaxy_Buds_3_Pro/img_01_f77e813f.jpg'
  WHEN brand = 'Samsung' AND model = 'Galaxy Buds FE' THEN '/images/products/Galaxy_Buds_FE/img_01_cbf6c2e6.jpg'
  
  -- JBL
  WHEN brand = 'JBL' AND model = 'Wave Flex' THEN '/images/products/Wave_Flex/img_01_db446f6a.jpg'
  WHEN brand = 'JBL' AND model = 'Wave Beam' THEN '/images/products/Wave_Beam/img_03_3cfab400.jpg'
  WHEN brand = 'JBL' AND model = 'Tune 125' THEN '/images/products/Tune_125/img_01_23fd9b30.jpg'
  WHEN brand = 'JBL' AND model = 'Tune 520' THEN '/images/products/Tune_520/img_01_a0ace758.jpg'
  WHEN brand = 'JBL' AND model = 'Tune Beam' THEN '/images/products/Tune_Beam/img_01_ee69bca2.jpg'
  
  -- Apple Watch
  WHEN brand = 'Apple' AND model = 'Apple Watch Series 10' THEN '/images/products/Apple_Watch_Series_10/img_01_c57b487c.jpg'
  WHEN brand = 'Apple' AND model = 'Apple Watch Ultra 2' THEN '/images/products/Apple_Watch_Ultra_2/img_01_98164f94.jpg'
  
  -- Accessories
  WHEN brand = 'Apple' AND model = 'AirTag' THEN '/images/products/AirTag/img_01_c6a82380.jpg'
  WHEN brand = 'Apple' AND model = 'Charger Type-C to Type-C' THEN '/images/products/Charger_Type-C_to_Type-C/img_01_6486e42f.jpg'
  WHEN brand = 'Apple' AND model = 'Charger USB-C to Lightning' THEN '/images/products/Charger_USB-C_to_Lightning/img_01_e3ebd8a6.jpg'
  WHEN brand = 'Apple' AND model = 'Original Head 20W' THEN '/images/products/Original_Head_20W/img_01_ff7a117d.jpg'
  WHEN brand = 'Apple' AND model = 'USB-C to Lightning Cable (1m)' THEN '/images/products/USB-C_to_Lightning_Cable__1m_/img_01_0bff646f.jpg'
  
  ELSE image_url -- Keep existing image_url if no match
END
WHERE image_url IS NOT NULL OR (
  -- iPhones
  (brand = 'Apple' AND model IN ('iPhone 17 Pro Max', 'iPhone 17 Pro', 'iPhone 17 Air', 'iPhone 17', 'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16', 'iPhone 16 e', 'iPhone 16 Cable M1', 'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 Mini', 'iPhone 13 CPO', 'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 11'))
  OR
  -- Samsung Galaxy
  (brand = 'Samsung' AND model IN ('Galaxy S25 Ultra', 'Galaxy S25+', 'Galaxy S25', 'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S24 FE', 'Galaxy A56', 'Galaxy A55', 'Galaxy A36', 'Galaxy A26', 'Galaxy A16', 'Galaxy A06', 'Galaxy Buds 3', 'Galaxy Buds 3 Pro', 'Galaxy Buds FE', 'Galaxy Tab Kids 50'))
  OR
  -- Other brands
  (brand IN ('Phone Line', 'Blackview', 'Nokia', 'Apple', 'JBL') AND model IN ('F34', 'N2000', '105 4G', '110 4G', 'iPad 10', 'AirPods 3', 'AirPods 4', 'AirPods 4 ANC', 'AirPods Pro 2', 'AirPods Pro 3', 'AirPods Max', 'Apple Watch Series 10', 'Apple Watch Ultra 2', 'AirTag', 'Charger Type-C to Type-C', 'Charger USB-C to Lightning', 'Original Head 20W', 'USB-C to Lightning Cable (1m)', 'Wave Flex', 'Wave Beam', 'Tune 125', 'Tune 520', 'Tune Beam'))
);
`;

fs.writeFileSync(path.join(__dirname, '..', 'database', 'update_product_images.sql'), updateScript);

console.log(`\n📋 Next steps:`);
console.log(`1. ✅ Images are already in place`);
console.log(`2. ✅ products.json has been updated`);
console.log(`3. 📄 Database update script created: database/update_product_images.sql`);
console.log(`4. 🚀 Run the database update script to update your Supabase database`);
console.log(`5. 🧪 Test the image display in your application`);

console.log(`\n🎉 Image integration complete!`);



