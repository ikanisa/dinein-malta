-- Add claimed column to vendors table
-- Tracks whether a venue has been claimed by an owner

ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS claimed BOOLEAN DEFAULT FALSE NOT NULL;

-- Add index for filtering by claimed status (useful for admin views)
CREATE INDEX IF NOT EXISTS idx_vendors_claimed ON vendors(claimed);

-- Update comment
COMMENT ON COLUMN vendors.claimed IS 'Whether this venue has been claimed by an owner';
