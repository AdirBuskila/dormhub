-- Seed data for deals based on real examples from Ofir
-- Note: Replace product_id values with actual UUIDs from your products table

-- Deal 1: iPhone 16 Pro Max 256 יבואן רשמי - 4 units in stock
INSERT INTO deals (
  title,
  description,
  product_id,
  is_active,
  priority,
  tier_1_qty, tier_1_price,
  tier_2_qty, tier_2_price,
  expiration_type,
  max_quantity,
  sold_quantity,
  payment_methods,
  payment_surcharge_check_month,
  payment_notes,
  allowed_colors,
  required_importer,
  notes
) VALUES (
  'במלאייי ‼‼ iPhone 16 Pro Max 256 יבואן רשמי',
  'נטורל / דזרט / שחור. 4 יח במלאי אין להשיג יותר יבואן רשמי.',
  (SELECT id FROM products WHERE brand = 'Apple' AND model LIKE '%iPhone 16 Pro Max%' AND storage = '256' LIMIT 1),
  true,
  10, -- High priority
  1, 4800.00,
  2, 4750.00,
  'quantity',
  4,
  0,
  ARRAY['cash', 'bank_transfer', 'check_month'],
  50.00,
  'מחיר למזומן / העברה / צ׳ק עד חודש תוספת של 50₪',
  ARRAY['Natural', 'Desert', 'Black'],
  'official',
  '4 יח במלאי אין להשיג יותר'
);

-- Deal 2: iPhone 13 128 יבואן רשמי שחור
INSERT INTO deals (
  title,
  description,
  product_id,
  is_active,
  priority,
  tier_1_qty, tier_1_price,
  tier_2_qty, tier_2_price,
  expiration_type,
  payment_methods,
  payment_notes,
  allowed_colors,
  required_importer,
  notes
) VALUES (
  'במלאייי !!! iPhone 13 128 יבואן רשמי',
  'סי דאטה / אייקון גרופ. צבע שחור בלבד',
  (SELECT id FROM products WHERE brand = 'Apple' AND model LIKE '%iPhone 13%' AND storage = '128' LIMIT 1),
  true,
  8,
  1, 1900.00,
  2, 1850.00,
  'none',
  ARRAY['cash', 'bank_transfer', 'check_week'],
  'מחיר למזומן / העברה / צ׳ק שבוע',
  ARRAY['Black'],
  'official',
  'סי דאטה / אייקון גרופ'
);

-- Deal 3: iPhone 14 128 יבואן רשמי שחור
INSERT INTO deals (
  title,
  description,
  product_id,
  is_active,
  priority,
  tier_1_qty, tier_1_price,
  tier_2_qty, tier_2_price,
  tier_3_qty, tier_3_price,
  expiration_type,
  payment_methods,
  payment_notes,
  allowed_colors,
  required_importer,
  notes
) VALUES (
  'במלאייי !!! iPhone 14 128 יבואן רשמי',
  'סי דאטה / אייקון גרופ. צבע שחור בלבד',
  (SELECT id FROM products WHERE brand = 'Apple' AND model LIKE '%iPhone 14%' AND storage = '128' LIMIT 1),
  true,
  8,
  1, 2250.00,
  2, 2200.00,
  3, 2150.00,
  'none',
  ARRAY['cash', 'bank_transfer', 'check_week'],
  'מחיר למזומן / העברה / צ׳ק שבוע',
  ARRAY['Black'],
  'official',
  'סי דאטה / אייקון גרופ'
);

-- Deal 4: iPhone 17 Pro 256 eSIM כחול - מבצע עד יום חמישי
INSERT INTO deals (
  title,
  description,
  product_id,
  is_active,
  priority,
  tier_1_qty, tier_1_price,
  tier_2_qty, tier_2_price,
  expiration_type,
  expires_at,
  payment_methods,
  payment_notes,
  allowed_colors,
  is_esim,
  notes
) VALUES (
  'מבצעעע 🔥 iPhone 17 Pro 256 eSIM',
  'עד גמר המלאי / יום חמישי בשעה 18:00⏳. כחול בלבד',
  (SELECT id FROM products WHERE brand = 'Apple' AND model LIKE '%iPhone 17 Pro%' AND storage = '256' LIMIT 1),
  true,
  15, -- Very high priority
  1, 4950.00,
  2, 4850.00,
  'date',
  '2025-10-23 18:00:00+03', -- Next Thursday at 18:00 (adjust as needed)
  ARRAY['cash', 'bank_transfer'],
  'מחיר למזומן / העברה בלבד',
  ARRAY['Blue'],
  true,
  'עד גמר המלאי / יום חמישי בשעה 18:00⏳'
);

-- Deal 5: iPhone 17 Air 256 eSIM - מבצע עד יום ראשון
INSERT INTO deals (
  title,
  description,
  product_id,
  is_active,
  priority,
  tier_1_qty, tier_1_price,
  tier_2_qty, tier_2_price,
  expiration_type,
  expires_at,
  payment_methods,
  allowed_colors,
  is_esim,
  notes
) VALUES (
  'מבצעעע 💥 iPhone 17 Air 256 eSIM חדש',
  'עד גמר המלאי / יום ראשון בשעה 18:00⏳. שחור / לבן / זהב',
  (SELECT id FROM products WHERE brand = 'Apple' AND model LIKE '%iPhone 17 Air%' AND storage = '256' LIMIT 1),
  true,
  14,
  1, 4300.00,
  2, 4200.00,
  'date',
  '2025-10-26 18:00:00+03', -- Next Sunday at 18:00
  ARRAY['cash', 'bank_transfer'],
  ARRAY['Black', 'White', 'Gold'],
  true,
  'עד גמר המלאי / יום ראשון בשעה 18:00⏳'
);

-- Deal 6: iPhone 17 Pro 256 יבואן רשמי הוט מובייל - יחידה בודדת
INSERT INTO deals (
  title,
  description,
  product_id,
  is_active,
  priority,
  tier_1_qty, tier_1_price,
  expiration_type,
  max_quantity,
  sold_quantity,
  payment_methods,
  payment_notes,
  allowed_colors,
  required_importer,
  notes
) VALUES (
  'במלאי!!!! יחידה בודדת iPhone 17 Pro 256',
  'יבואן רשמי הוט מובייל צבע כחול',
  (SELECT id FROM products WHERE brand = 'Apple' AND model LIKE '%iPhone 17 Pro%' AND storage = '256' LIMIT 1),
  true,
  12,
  1, 5450.00,
  'quantity',
  1,
  0,
  ARRAY['cash', 'bank_transfer'],
  'מחיר למזומן / העברה בלבד',
  ARRAY['Blue'],
  'official',
  'יחידה בודדת - הוט מובייל'
);

-- Deal 7: iPhone 17 Pro 512 כתום - יחידה בודדת
INSERT INTO deals (
  title,
  description,
  product_id,
  is_active,
  priority,
  tier_1_qty, tier_1_price,
  expiration_type,
  max_quantity,
  sold_quantity,
  payment_methods,
  payment_notes,
  allowed_colors,
  required_importer,
  notes
) VALUES (
  'במלאי!!!! יחידה בודדת iPhone 17 Pro 512',
  'יבואן רשמי צבע כתום',
  (SELECT id FROM products WHERE brand = 'Apple' AND model LIKE '%iPhone 17 Pro%' AND storage = '512' LIMIT 1),
  true,
  11,
  1, 6750.00,
  'quantity',
  1,
  0,
  ARRAY['cash', 'bank_transfer'],
  'מחיר למזומן / העברה בלבד',
  ARRAY['Orange'],
  'official',
  'יחידה בודדת'
);

-- Deal 8: iPhone 17 Pro Max 512 כתום - יחידה בודדת
INSERT INTO deals (
  title,
  description,
  product_id,
  is_active,
  priority,
  tier_1_qty, tier_1_price,
  expiration_type,
  max_quantity,
  sold_quantity,
  payment_methods,
  payment_notes,
  allowed_colors,
  required_importer,
  notes
) VALUES (
  'במלאי!!!! יחידה בודדת iPhone 17 Pro Max 512',
  'יבואן רשמי צבע כתום',
  (SELECT id FROM products WHERE brand = 'Apple' AND model LIKE '%iPhone 17 Pro Max%' AND storage = '512' LIMIT 1),
  true,
  11,
  1, 7500.00,
  'quantity',
  1,
  0,
  ARRAY['cash', 'bank_transfer'],
  'מחיר למזומן / העברה בלבד',
  ARRAY['Orange'],
  'official',
  'יחידה בודדת'
);

-- Additional sample deals for variety

-- Deal 9: Samsung Galaxy S24 Ultra - Flash Sale
INSERT INTO deals (
  title,
  description,
  product_id,
  is_active,
  priority,
  tier_1_qty, tier_1_price,
  tier_2_qty, tier_2_price,
  tier_3_qty, tier_3_price,
  expiration_type,
  expires_at,
  max_quantity,
  payment_methods,
  payment_notes,
  notes
) VALUES (
  '🔥 מבצע בזק Samsung Galaxy S24 Ultra',
  'מבצע מיוחד לזמן מוגבל! כל הצבעים זמינים',
  (SELECT id FROM products WHERE brand = 'Samsung' AND model LIKE '%Galaxy S24 Ultra%' LIMIT 1),
  true,
  9,
  1, 4500.00,
  2, 4350.00,
  3, 4200.00,
  'both',
  '2025-10-25 23:59:59+03',
  10,
  ARRAY['cash', 'bank_transfer', 'check_week'],
  'מחיר למזומן / העברה / צ׳ק שבוע',
  'מבצע בזק - עד גמר המלאי או עד יום שבת'
);

-- Deal 10: AirPods Pro 2 - Bundle Deal
INSERT INTO deals (
  title,
  description,
  product_id,
  is_active,
  priority,
  tier_1_qty, tier_1_price,
  tier_2_qty, tier_2_price,
  expiration_type,
  payment_methods,
  notes
) VALUES (
  '⚡ מבצע חבילה AirPods Pro 2',
  'קנה 2 קבל הנחה! מלאי מוגבל',
  (SELECT id FROM products WHERE brand = 'Apple' AND model LIKE '%AirPods Pro 2%' LIMIT 1),
  true,
  7,
  1, 950.00,
  2, 900.00,
  'none',
  ARRAY['cash', 'bank_transfer', 'check_month'],
  'מבצע חבילה מיוחד'
);

-- Add more sample deals
-- Deal 11: iPhone 15 Pro Max clearance
INSERT INTO deals (
  title,
  description,
  product_id,
  is_active,
  priority,
  tier_1_qty, tier_1_price,
  tier_2_qty, tier_2_price,
  expiration_type,
  payment_methods,
  payment_surcharge_check_month,
  payment_notes,
  notes
) VALUES (
  '💥 סוף עונה iPhone 15 Pro Max 256',
  'מחירי סוף עונה! כל הצבעים במלאי',
  (SELECT id FROM products WHERE brand = 'Apple' AND model LIKE '%iPhone 15 Pro Max%' AND storage = '256' LIMIT 1),
  true,
  6,
  1, 4200.00,
  2, 4100.00,
  'none',
  ARRAY['cash', 'bank_transfer', 'check_month'],
  100.00,
  'מזומן/העברה או צ׳ק עד חודש (+100₪)',
  'סוף עונה - כל הצבעים'
);

COMMENT ON TABLE deals IS 'Real deals based on Ofir''s WhatsApp messages with tiered pricing and restrictions';

