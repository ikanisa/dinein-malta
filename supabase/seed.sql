-- SEED DATA for DineIn

-- 1. Countries
INSERT INTO public.countries (code, name, currency, currency_symbol, is_active) VALUES
    ('MT', 'Malta', 'EUR', '€', true),
    ('RW', 'Rwanda', 'RWF', 'FRw', true)
ON CONFLICT (code) DO NOTHING;

-- 2. Venues
-- Kigali (RW)
INSERT INTO public.venues (id, country, slug, name, status, created_at, updated_at) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'RW', 'kigali-social', 'Kigali Social Club', 'active', now(), now()),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'RW', 'bourbon-coffee', 'Bourbon Coffee', 'active', now(), now()),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'RW', 'republica', 'Republica Lounge', 'active', now(), now()),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'RW', 'question-coffee', 'Question Coffee', 'active', now(), now())
ON CONFLICT (slug) DO NOTHING;

-- Malta (MT)
INSERT INTO public.venues (id, country, slug, name, status, created_at, updated_at) VALUES
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'MT', 'valletta-bistro', 'Valletta Bistro', 'active', now(), now()),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12', 'MT', 'mdina-tea', 'Mdina Tea Garden', 'active', now(), now()),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13', 'MT', 'sliema-grill', 'Sliema Grill', 'active', now(), now()),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b14', 'MT', 'gozo-farm', 'Gozo Farm Table', 'active', now(), now())
ON CONFLICT (slug) DO NOTHING;

-- 3. Menus (One active menu per venue)
INSERT INTO public.menus (id, venue_id, version, is_active) VALUES
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, true), -- Kigali Social
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 1, true)  -- Valletta Bistro
ON CONFLICT DO NOTHING;

-- 4. Categories (Kigali Social)
INSERT INTO public.menu_categories (id, menu_id, name, sort_order) VALUES
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'Starters', 1),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d12', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'Mainer', 2),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d13', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'Drinks', 3)
ON CONFLICT DO NOTHING;

-- 5. Items (Kigali Social)
INSERT INTO public.menu_items (venue_id, category_id, name, description, price, currency, is_available, sort_order) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', 'Samosas', 'Three crispy beef samosas', 2000, 'RWF', true, 1),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', 'Chicken Wings', 'Spicy glazed wings', 4500, 'RWF', true, 2),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d12', 'Grilled Tilapia', 'Whole fish with roast potatoes', 8000, 'RWF', true, 1),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d12', 'Beef Brochette', 'Served with fries and salad', 5000, 'RWF', true, 2),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d13', 'Virunga Mist', 'Local craft beer', 3000, 'RWF', true, 1),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d13', 'Passion Fruit Juice', 'Freshly squeezed', 2500, 'RWF', true, 2);

-- 6. Promotions
INSERT INTO public.promotions (venue_id, title, body, is_active, active_from, active_to) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Happy Hour', '2-for-1 cocktails every Friday 5-7pm!', true, now(), now() + interval '1 year'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'Lunch Special', 'Free coffee with any main course.', true, now(), now() + interval '1 year');

-- 7. Venue Claims (Demo)
-- We'd need user IDs for this. Skipping valid claims seeding to avoid foreign key errors if users don't exist.
-- But we can seed a pending claim if we had a user ID.
-- For now, empty claims table is fine for testing 'no claims state'.

