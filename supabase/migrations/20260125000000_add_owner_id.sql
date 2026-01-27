-- Add owner_id to vendors table for linking to auth.users
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_vendors_owner_id ON vendors(owner_id);

-- Update RLS Policies to use owner_id
-- (Assuming existing policy checking owner_email might need to remain or be replaced?)
-- Let's ADD a policy for owner_id.

CREATE POLICY "Enable read access for public" ON vendors
    FOR SELECT USING (true); -- Public can view all venues (claimed logic filtered in app?)

-- Allow Owner to UPDATE their own venue
CREATE POLICY "Enable update for owners based on owner_id" ON vendors
    FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- Function to link user (for Edge Function use via Service Role - RLS bypasses automatically)
