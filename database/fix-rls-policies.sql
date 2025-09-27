-- Fix RLS policies for development (allow anonymous access)
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON products;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON clients;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON orders;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON order_items;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON payments;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON returns;

-- Create new policies that allow anonymous access for development
CREATE POLICY "Allow all operations for development" ON products
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for development" ON clients
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for development" ON orders
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for development" ON order_items
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for development" ON payments
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for development" ON returns
    FOR ALL USING (true);
