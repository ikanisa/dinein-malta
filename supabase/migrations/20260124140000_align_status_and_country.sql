-- Migration: Align order statuses and remove legacy constraints
-- Date: 2026-01-24
-- Description: Updates order_status enum to match STARTER RULES (placed, received, served, cancelled),
-- removes vendors_country_mt_chk, and drops currency constraints.
-- 
-- Value mapping:
-- 'new' -> 'placed'
-- 'received' -> 'received'
-- 'preparing' -> 'received' (in progress state maps to received)
-- 'ready' -> 'received' (ready but not yet served)
-- 'served' -> 'served'
-- 'cancelled' -> 'cancelled'
-- 'completed' -> 'served' (completed = served)

BEGIN;

-- 1. Update order_status enum
-- First, drop the default (which references old type)
ALTER TABLE orders ALTER COLUMN status DROP DEFAULT;

-- Drop the function that depends on the old type
DROP FUNCTION IF EXISTS validate_order_status_transition(order_status, order_status);

-- Create a temporary text column to hold the mapped values
ALTER TABLE orders ADD COLUMN status_temp text;

-- Map old enum values to new text values
UPDATE orders SET status_temp = CASE 
  WHEN status::text = 'new' THEN 'placed'
  WHEN status::text = 'preparing' THEN 'received'
  WHEN status::text = 'ready' THEN 'received'
  WHEN status::text = 'completed' THEN 'served'
  ELSE status::text -- received, served, cancelled stay as-is
END;

-- Drop the old status column
ALTER TABLE orders DROP COLUMN status;

-- Rename the old type
ALTER TYPE order_status RENAME TO order_status_old;

-- Create new type with correct values
CREATE TYPE order_status AS ENUM ('placed', 'received', 'served', 'cancelled');

-- Add new status column with the new type
ALTER TABLE orders ADD COLUMN status order_status DEFAULT 'placed'::order_status;

-- Populate from temp column
UPDATE orders SET status = status_temp::order_status;

-- Drop temp column
ALTER TABLE orders DROP COLUMN status_temp;

-- Drop the old type (now safe since function was dropped)
DROP TYPE order_status_old;

-- Recreate the validation function with the new enum type
CREATE OR REPLACE FUNCTION public.validate_order_status_transition(
  old_status order_status,
  new_status order_status
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow same status (for other field updates)
  IF old_status = new_status THEN
    RETURN true;
  END IF;
  
  -- New simplified workflow transitions:
  -- placed -> received -> served
  -- Any status -> cancelled (emergency cancel)
  
  IF new_status = 'cancelled' THEN
    RETURN true; -- Can cancel from any status
  END IF;
  
  -- Valid forward transitions
  IF old_status = 'placed' AND new_status = 'received' THEN
    RETURN true;
  END IF;
  
  IF old_status = 'received' AND new_status = 'served' THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- 2. Remove vendors_country_mt_chk constraint if it exists
ALTER TABLE vendors DROP CONSTRAINT IF EXISTS vendors_country_mt_chk;

-- 3. Remove currency check constraints if they exist
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_currency_eur_chk;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_currency_eur_chk;

-- 4. Add new country check constraint that allows RW and MT
-- First drop if exists to avoid duplicate
ALTER TABLE vendors DROP CONSTRAINT IF EXISTS vendors_country_check;
ALTER TABLE vendors 
  ADD CONSTRAINT vendors_country_check 
  CHECK (country IN ('RW', 'MT'));

COMMIT;
