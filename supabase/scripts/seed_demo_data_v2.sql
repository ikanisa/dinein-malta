-- ==========================================
-- ENHANCED IDEMPOTENT DEMO DATA SEED SCRIPT v2
-- ==========================================
-- This script creates comprehensive demo data for QA and demos.
-- It is fully idempotent (safe to run multiple times).
-- 
-- USAGE:
--   psql "$DATABASE_URL" -f supabase/scripts/seed_demo_data_v2.sql
--
-- REQUIREMENTS:
--   - All migrations must be applied first
--   - Auth users should be created separately via Supabase Auth
--     (this script uses deterministic UUIDs for demo purposes)
--
-- DEMO ACCOUNTS (create in Supabase Auth with these emails):
--   - admin@dinein.mt (UUID: 00000000-0000-0000-0000-000000000001)
--   - owner@zion.mt (UUID: 00000000-0000-0000-0000-000000000010)
--   - manager@zion.mt (UUID: 00000000-0000-0000-0000-000000000011)
--   - staff@zion.mt (UUID: 00000000-0000-0000-0000-000000000012)
--   - client@demo.mt (UUID: 00000000-0000-0000-0000-000000000020)

-- ============================================================================
-- DETERMINISTIC IDs (for reproducible testing)
-- ============================================================================

DO $$
DECLARE
  -- Auth User IDs (create these in Supabase Auth)
  demo_admin_auth_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
  owner_auth_id uuid := '00000000-0000-0000-0000-000000000010'::uuid;
  manager_auth_id uuid := '00000000-0000-0000-0000-000000000011'::uuid;
  staff_auth_id uuid := '00000000-0000-0000-0000-000000000012'::uuid;
  client_auth_id uuid := '00000000-0000-0000-0000-000000000020'::uuid;
  client2_auth_id uuid := '00000000-0000-0000-0000-000000000021'::uuid;
  
  -- Vendor IDs
  zion_vendor_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
  victoria_vendor_id uuid := '22222222-2222-2222-2222-222222222222'::uuid;
  
  -- Table IDs
  zion_table1_id uuid := '33333333-3333-3333-3333-333333333301'::uuid;
  zion_table2_id uuid := '33333333-3333-3333-3333-333333333302'::uuid;
  victoria_table1_id uuid := '33333333-3333-3333-3333-333333333401'::uuid;
  
  -- Order IDs
  order_new_id uuid := '44444444-4444-4444-4444-444444444401'::uuid;
  order_preparing_id uuid := '44444444-4444-4444-4444-444444444402'::uuid;
  order_ready_id uuid := '44444444-4444-4444-4444-444444444403'::uuid;
  order_completed_id uuid := '44444444-4444-4444-4444-444444444404'::uuid;
  
  -- Menu Item IDs (for order items)
  espresso_id uuid;
  burger_id uuid;
  
BEGIN
  -- ==========================================================================
  -- 1. ADMIN USER
  -- ==========================================================================
  
  INSERT INTO public.admin_users (id, auth_user_id, role, is_active)
  VALUES (gen_random_uuid(), demo_admin_auth_id, 'admin', true)
  ON CONFLICT (auth_user_id) DO NOTHING;
  
  INSERT INTO public.profiles (id, name, role, notifications_enabled)
  VALUES (demo_admin_auth_id, 'Demo Admin', 'ADMIN', true)
  ON CONFLICT (id) DO UPDATE SET name = 'Demo Admin', role = 'ADMIN';
  
  -- ==========================================================================
  -- 2. DEMO VENDORS
  -- ==========================================================================
  
  -- Zion Reggae Bar
  INSERT INTO public.vendors (
    id, country, google_place_id, slug, name, address, 
    lat, lng, status, phone, whatsapp, rating, review_count
  )
  VALUES (
    zion_vendor_id, 'MT', 'ChIJDemo_Zion_Bar_Malta', 'zion-reggae-bar',
    'Zion Reggae Bar', 'Triq San Pawl, St. Paul''s Bay, Malta',
    35.9500, 14.4000, 'active', '+35699123456', '+35699123456', 4.5, 42
  )
  ON CONFLICT (google_place_id) DO UPDATE SET
    name = EXCLUDED.name, status = EXCLUDED.status, rating = EXCLUDED.rating;
  
  -- Victoria Gastro Pub
  INSERT INTO public.vendors (
    id, country, google_place_id, slug, name, address,
    lat, lng, status, phone, whatsapp, rating, review_count
  )
  VALUES (
    victoria_vendor_id, 'MT', 'ChIJDemo_Victoria_Pub_Malta', 'victoria-gastro-pub',
    'Victoria Gastro Pub', 'Triq il-Kbira, Victoria, Gozo, Malta',
    36.0444, 14.2392, 'active', '+35621556677', '+35679556677', 4.7, 89
  )
  ON CONFLICT (google_place_id) DO UPDATE SET
    name = EXCLUDED.name, status = EXCLUDED.status, rating = EXCLUDED.rating;
  
  -- ==========================================================================
  -- 3. VENDOR USERS (Staff Roles)
  -- ==========================================================================
  
  -- Zion: Owner
  INSERT INTO public.vendor_users (vendor_id, auth_user_id, role, is_active)
  VALUES (zion_vendor_id, owner_auth_id, 'owner', true)
  ON CONFLICT (vendor_id, auth_user_id) DO UPDATE SET role = 'owner';
  
  -- Zion: Manager
  INSERT INTO public.vendor_users (vendor_id, auth_user_id, role, is_active)
  VALUES (zion_vendor_id, manager_auth_id, 'manager', true)
  ON CONFLICT (vendor_id, auth_user_id) DO UPDATE SET role = 'manager';
  
  -- Zion: Staff
  INSERT INTO public.vendor_users (vendor_id, auth_user_id, role, is_active)
  VALUES (zion_vendor_id, staff_auth_id, 'staff', true)
  ON CONFLICT (vendor_id, auth_user_id) DO UPDATE SET role = 'staff';
  
  -- Vendor user profiles
  INSERT INTO public.profiles (id, name, role) VALUES
    (owner_auth_id, 'John Owner', 'VENDOR'),
    (manager_auth_id, 'Maria Manager', 'VENDOR'),
    (staff_auth_id, 'Steve Staff', 'VENDOR')
  ON CONFLICT (id) DO NOTHING;
  
  -- ==========================================================================
  -- 4. CLIENT USERS
  -- ==========================================================================
  
  INSERT INTO public.profiles (id, name, role, notifications_enabled) VALUES
    (client_auth_id, 'Alice Customer', 'CLIENT', true),
    (client2_auth_id, 'Bob Diner', 'CLIENT', true)
  ON CONFLICT (id) DO NOTHING;
  
  -- ==========================================================================
  -- 5. TABLES
  -- ==========================================================================
  
  INSERT INTO public.tables (id, vendor_id, table_number, label, public_code, is_active)
  VALUES
    (zion_table1_id, zion_vendor_id, 1, 'Table 1', 'ZION-T1-ABC', true),
    (zion_table2_id, zion_vendor_id, 2, 'Table 2', 'ZION-T2-DEF', true),
    ('33333333-3333-3333-3333-333333333303'::uuid, zion_vendor_id, 3, 'Table 3', 'ZION-T3-GHI', true),
    ('33333333-3333-3333-3333-333333333304'::uuid, zion_vendor_id, 4, 'Bar Seat 1', 'ZION-B1-JKL', true),
    ('33333333-3333-3333-3333-333333333305'::uuid, zion_vendor_id, 5, 'Bar Seat 2', 'ZION-B2-MNO', true),
    (victoria_table1_id, victoria_vendor_id, 1, 'Table 1', 'VIC-T1-PQR', true),
    ('33333333-3333-3333-3333-333333333402'::uuid, victoria_vendor_id, 2, 'Table 2', 'VIC-T2-STU', true),
    ('33333333-3333-3333-3333-333333333403'::uuid, victoria_vendor_id, 3, 'Terrace 1', 'VIC-TR1-VWX', true)
  ON CONFLICT (id) DO NOTHING;
  
  -- ==========================================================================
  -- 6. MENU ITEMS
  -- ==========================================================================
  
  -- Zion menu
  INSERT INTO public.menu_items (id, vendor_id, category, name, description, price, is_available)
  VALUES
    ('55555555-5555-5555-5555-555555555501'::uuid, zion_vendor_id, 'Coffees & Teas', 'Espresso', 'Classic Italian espresso', 1.50, true),
    ('55555555-5555-5555-5555-555555555502'::uuid, zion_vendor_id, 'Coffees & Teas', 'Cappuccino', 'Espresso with steamed milk foam', 2.50, true),
    ('55555555-5555-5555-5555-555555555503'::uuid, zion_vendor_id, 'Pizza', 'Margherita', 'Classic tomato and mozzarella', 10.00, true),
    ('55555555-5555-5555-5555-555555555504'::uuid, zion_vendor_id, 'Burgers', 'Zion Burger', 'House specialty burger', 14.00, true),
    ('55555555-5555-5555-5555-555555555505'::uuid, zion_vendor_id, 'Burgers', 'Cheese Burger', 'Classic cheeseburger', 10.00, true),
    ('55555555-5555-5555-5555-555555555506'::uuid, zion_vendor_id, 'Cocktails', 'Cuban Mojito', 'Rum, mint, lime, soda', 8.00, true),
    ('55555555-5555-5555-5555-555555555507'::uuid, zion_vendor_id, 'Beer', 'Cisk Lager Pint', 'Local Maltese lager', 4.80, true)
  ON CONFLICT (id) DO NOTHING;
  
  -- Victoria menu
  INSERT INTO public.menu_items (id, vendor_id, category, name, description, price, is_available)
  VALUES
    ('55555555-5555-5555-5555-555555555601'::uuid, victoria_vendor_id, 'Starters', 'Garlic Bread', 'Freshly baked with garlic butter', 5.50, true),
    ('55555555-5555-5555-5555-555555555602'::uuid, victoria_vendor_id, 'Pizza', 'Quattro Formaggi', 'Four cheese pizza', 14.50, true),
    ('55555555-5555-5555-5555-555555555603'::uuid, victoria_vendor_id, 'Burgers', 'Victoria Truffle Burger', 'Premium truffle burger', 15.50, true),
    ('55555555-5555-5555-5555-555555555604'::uuid, victoria_vendor_id, 'Mains', 'Fish & Chips', 'Beer battered fish with fries', 19.50, true),
    ('55555555-5555-5555-5555-555555555605'::uuid, victoria_vendor_id, 'Beverages', 'Coca Cola', 'Classic cola', 4.00, true)
  ON CONFLICT (id) DO NOTHING;
  
  -- Store IDs for order items
  espresso_id := '55555555-5555-5555-5555-555555555501'::uuid;
  burger_id := '55555555-5555-5555-5555-555555555504'::uuid;
  
  -- ==========================================================================
  -- 7. SAMPLE ORDERS (Different Statuses)
  -- ==========================================================================
  
  -- Order 1: NEW (just placed)
  INSERT INTO public.orders (id, vendor_id, table_id, client_auth_user_id, status, total_amount, notes)
  VALUES (
    order_new_id, zion_vendor_id, zion_table1_id, client_auth_id,
    'new', 15.50, 'No onions please'
  )
  ON CONFLICT (id) DO UPDATE SET status = 'new';
  
  -- Order 2: PREPARING (in kitchen)
  INSERT INTO public.orders (id, vendor_id, table_id, client_auth_user_id, status, total_amount, notes)
  VALUES (
    order_preparing_id, zion_vendor_id, zion_table2_id, client_auth_id,
    'preparing', 28.00, NULL
  )
  ON CONFLICT (id) DO UPDATE SET status = 'preparing';
  
  -- Order 3: READY (waiting for pickup)
  INSERT INTO public.orders (id, vendor_id, table_id, client_auth_user_id, status, total_amount, notes)
  VALUES (
    order_ready_id, zion_vendor_id, zion_table1_id, client2_auth_id,
    'ready', 12.80, NULL
  )
  ON CONFLICT (id) DO UPDATE SET status = 'ready';
  
  -- Order 4: COMPLETED (historical)
  INSERT INTO public.orders (id, vendor_id, table_id, client_auth_user_id, status, total_amount, notes)
  VALUES (
    order_completed_id, victoria_vendor_id, victoria_table1_id, client_auth_id,
    'completed', 35.00, 'Great meal!'
  )
  ON CONFLICT (id) DO UPDATE SET status = 'completed';
  
  -- ==========================================================================
  -- 8. ORDER ITEMS
  -- ==========================================================================
  
  INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal)
  VALUES
    -- Order 1 items
    ('66666666-6666-6666-6666-666666666601'::uuid, order_new_id, espresso_id, 1, 1.50, 1.50),
    ('66666666-6666-6666-6666-666666666602'::uuid, order_new_id, burger_id, 1, 14.00, 14.00),
    -- Order 2 items
    ('66666666-6666-6666-6666-666666666603'::uuid, order_preparing_id, burger_id, 2, 14.00, 28.00),
    -- Order 3 items
    ('66666666-6666-6666-6666-666666666604'::uuid, order_ready_id, '55555555-5555-5555-5555-555555555507'::uuid, 2, 4.80, 9.60),
    ('66666666-6666-6666-6666-666666666605'::uuid, order_ready_id, espresso_id, 2, 1.50, 3.00)
  ON CONFLICT (id) DO NOTHING;
  
  -- ==========================================================================
  -- 9. FAVORITES
  -- ==========================================================================
  
  INSERT INTO public.favorites (user_id, venue_id)
  VALUES
    (client_auth_id, zion_vendor_id),
    (client_auth_id, victoria_vendor_id),
    (client2_auth_id, zion_vendor_id)
  ON CONFLICT (user_id, venue_id) DO NOTHING;
  
  -- ==========================================================================
  -- 10. REVIEWS
  -- ==========================================================================
  
  INSERT INTO public.reviews (id, vendor_id, user_id, rating, comment)
  VALUES
    ('77777777-7777-7777-7777-777777777701'::uuid, zion_vendor_id, client_auth_id, 5, 'Amazing reggae vibes and great food!'),
    ('77777777-7777-7777-7777-777777777702'::uuid, zion_vendor_id, client2_auth_id, 4, 'Good burgers, a bit noisy but fun atmosphere.'),
    ('77777777-7777-7777-7777-777777777703'::uuid, victoria_vendor_id, client_auth_id, 5, 'Best fish and chips in Gozo!')
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Demo data seeded successfully!';
END $$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

SELECT '=== SEED DATA SUMMARY ===' as info;

SELECT 'admin_users' as table_name, count(*) as count FROM public.admin_users
UNION ALL SELECT 'vendors (active)', count(*) FROM public.vendors WHERE status = 'active'
UNION ALL SELECT 'vendor_users', count(*) FROM public.vendor_users
UNION ALL SELECT 'profiles', count(*) FROM public.profiles
UNION ALL SELECT 'menu_items', count(*) FROM public.menu_items
UNION ALL SELECT 'tables', count(*) FROM public.tables
UNION ALL SELECT 'orders', count(*) FROM public.orders
UNION ALL SELECT 'order_items', count(*) FROM public.order_items
UNION ALL SELECT 'favorites', count(*) FROM public.favorites
UNION ALL SELECT 'reviews', count(*) FROM public.reviews
ORDER BY table_name;

-- Show order status distribution
SELECT '=== ORDERS BY STATUS ===' as info;
SELECT status, count(*) FROM public.orders GROUP BY status ORDER BY status;
