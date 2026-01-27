-- Migration: Add user_favorites table for server-side favorites sync
-- This supports Supabase Anonymous Auth users storing their favorites

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_type TEXT NOT NULL CHECK (favorite_type IN ('venue', 'item')),
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, favorite_type, target_id)
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_type ON user_favorites(favorite_type);

-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own favorites
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Add user_id column to orders table for auth linking
-- This allows orders to be tied to the authenticated user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN user_id UUID REFERENCES auth.users(id);
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
  END IF;
END $$;

-- Update orders RLS to also allow access by user_id
-- Keep existing session_id access for backwards compatibility
DROP POLICY IF EXISTS "Orders: users can view own orders" ON orders;
CREATE POLICY "Orders: users can view own orders"
  ON orders FOR SELECT
  USING (
    auth.uid() = user_id OR 
    session_id IS NOT NULL -- Backwards compat for old orders
  );
