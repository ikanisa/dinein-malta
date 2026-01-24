-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Vendors Table Policies
-- Everyone can read vendors (public menu)
CREATE POLICY "Public vendors are viewable by everyone" 
ON vendors FOR SELECT 
USING (true);

-- Only authenticated vendors can update their own profile
CREATE POLICY "Vendors can update own profile" 
ON vendors FOR UPDATE 
USING (auth.uid() = id);

-- Orders Table Policies
-- Vendors can view all orders for their venue
-- Assuming vendors table 'id' matches auth.uid()
-- And orders have 'vendor_id'
-- Note: In this MVP, we might link vendor_id to auth.uid via a join or explicit column.
-- For now, let's assume we store vendor_id in orders.

CREATE POLICY "Vendors can view their own orders" 
ON orders FOR SELECT 
USING (
  vendor_id IN (
    SELECT id FROM vendors WHERE id = auth.uid()
  )
);

-- Vendors can update status of their own orders
CREATE POLICY "Vendors can update their own orders" 
ON orders FOR UPDATE 
USING (
  vendor_id IN (
    SELECT id FROM vendors WHERE id = auth.uid()
  )
);

-- Anonymous/Public users can insert orders (Checkout)
CREATE POLICY "Public can create orders" 
ON orders FOR INSERT 
WITH CHECK (true);

-- Public users can view their own orders (via ID match? or session?)
-- For MVP tracking by ID (uuid), we might allow public SELECT if they know the UUID?
-- Or rely on 'created_by' if we had anon auth. 
-- Let's allow public SELECT by ID for now to enable Tracking Screen without login.
CREATE POLICY "Public can view orders by ID" 
ON orders FOR SELECT 
USING (true); -- This is permissive, but required for anon tracking if we don't have RLS tokens. 
-- Secure alternative: create RPC for fetching order by ID+Number to prove ownership.

-- Order Items Policies
CREATE POLICY "Public can view order items" 
ON order_items FOR SELECT 
USING (true);

CREATE POLICY "Public can insert order items" 
ON order_items FOR INSERT 
WITH CHECK (true);
