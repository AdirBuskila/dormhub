-- Add clerk_user_id column to clients table
-- Run this in your Supabase SQL Editor

-- Add clerk_user_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'clerk_user_id'
    ) THEN
        ALTER TABLE clients ADD COLUMN clerk_user_id TEXT UNIQUE;
    END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_clients_clerk_user_id ON clients(clerk_user_id);

-- Update existing clients to have a placeholder clerk_user_id (for testing)
-- In production, you would migrate existing clients differently
UPDATE clients 
SET clerk_user_id = 'placeholder_' || id 
WHERE clerk_user_id IS NULL;

-- Add comment to the column
COMMENT ON COLUMN clients.clerk_user_id IS 'Clerk authentication user ID - links to Clerk user';
