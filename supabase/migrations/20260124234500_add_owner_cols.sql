
-- Add columns for Claim Flow (Request -> Approval)
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS owner_email text;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS owner_pin text;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS owner_phone text;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS contact_email text;

COMMENT ON COLUMN vendors.owner_email IS 'Pending claimer email (request)';
COMMENT ON COLUMN vendors.owner_pin IS 'Pending claimer pin (request)';
COMMENT ON COLUMN vendors.contact_email IS 'Active owner auth email (linked to Supabase Auth)';
