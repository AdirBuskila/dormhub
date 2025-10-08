-- Migration: Add new product categories
-- Date: 2024-10-08
-- Description: Expands product_category enum to include more specific categories like iPhone, Samsung, etc.

-- Add new category values to the enum
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'iphone';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'samsung';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'android_phone';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'smartwatch';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'chargers';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'cases';

-- Note: 'phone', 'tablet', 'earphones', and 'accessories' already exist
-- The new categories provide more granular categorization for inventory management

