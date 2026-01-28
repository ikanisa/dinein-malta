-- Migration: Guest Preferences and Intelligence
-- Enables AI to remember guest preferences across sessions

-- =============================================================================
-- FIX EXISTING SCHEMA (Missing links)
-- =============================================================================
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS menu_item_id UUID REFERENCES menu_items(id);

CREATE INDEX IF NOT EXISTS idx_order_items_menu_item 
ON order_items(menu_item_id);

-- =============================================================================
-- GUEST PREFERENCES TABLE
-- Stores dietary preferences, allergies, and personal notes per user
-- =============================================================================
CREATE TABLE IF NOT EXISTS guest_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preference_type TEXT NOT NULL CHECK (preference_type IN (
        'dietary',      -- vegetarian, vegan, pescatarian, etc.
        'allergy',      -- gluten, nuts, dairy, shellfish, etc.
        'dislike',      -- foods the user doesn't like
        'favorite',     -- favorite cuisines, ingredients
        'spice_level',  -- mild, medium, hot, extra hot
        'note'          -- freeform notes
    )),
    value TEXT NOT NULL,
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE, -- NULL = global
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, preference_type, value, venue_id)
);

-- Index for quick user lookup
CREATE INDEX IF NOT EXISTS idx_guest_preferences_user 
    ON guest_preferences(user_id);

-- Index for venue-specific preferences
CREATE INDEX IF NOT EXISTS idx_guest_preferences_venue 
    ON guest_preferences(venue_id) WHERE venue_id IS NOT NULL;

-- =============================================================================
-- GUEST MEMORY TABLE
-- Long-term memory for AI assistant (things the guest told Molty)
-- =============================================================================
CREATE TABLE IF NOT EXISTS guest_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    memory_key TEXT NOT NULL,  -- e.g., "name", "birthday", "usual_order"
    memory_value TEXT NOT NULL,
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE, -- NULL = global
    confidence NUMERIC(3,2) DEFAULT 1.0, -- How confident AI is (0-1)
    last_mentioned TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, memory_key, venue_id)
);

-- Index for user memory lookup
CREATE INDEX IF NOT EXISTS idx_guest_memory_user 
    ON guest_memory(user_id);

-- =============================================================================
-- ORDER ANALYTICS VIEW
-- Aggregated order history for recommendations
-- =============================================================================
CREATE OR REPLACE VIEW guest_order_analytics AS
SELECT 
    o.client_auth_user_id AS user_id,
    o.venue_id,
    oi.menu_item_id,
    mi.name AS item_name,
    mi.category_id,
    c.name AS category_name,
    COUNT(*) AS order_count,
    MAX(o.created_at) AS last_ordered,
    AVG(oi.qty) AS avg_quantity
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN menu_items mi ON oi.menu_item_id = mi.id
LEFT JOIN menu_categories c ON mi.category_id = c.id
WHERE o.status != 'cancelled'
GROUP BY o.client_auth_user_id, o.venue_id, oi.menu_item_id, mi.name, mi.category_id, c.name;

-- =============================================================================
-- POPULAR ITEMS PER VENUE VIEW
-- For recommendations to new customers
-- =============================================================================
CREATE OR REPLACE VIEW venue_popular_items AS
SELECT 
    o.venue_id,
    oi.menu_item_id,
    mi.name AS item_name,
    mi.category_id,
    COUNT(*) AS total_orders,
    COUNT(DISTINCT o.client_auth_user_id) AS unique_customers,
    MAX(o.created_at) AS last_ordered
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN menu_items mi ON oi.menu_item_id = mi.id
WHERE o.status != 'cancelled'
  AND o.created_at > now() - INTERVAL '30 days'
GROUP BY o.venue_id, oi.menu_item_id, mi.name, mi.category_id
ORDER BY total_orders DESC;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================
ALTER TABLE guest_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_memory ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'users_own_preferences' AND tablename = 'guest_preferences'
    ) THEN
        CREATE POLICY "users_own_preferences" ON guest_preferences
            FOR ALL
            TO authenticated
            USING (user_id = auth.uid())
            WITH CHECK (user_id = auth.uid());
    END IF;
END
$$;

-- Users can manage their own memory
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'users_own_memory' AND tablename = 'guest_memory'
    ) THEN
        CREATE POLICY "users_own_memory" ON guest_memory
            FOR ALL
            TO authenticated
            USING (user_id = auth.uid())
            WITH CHECK (user_id = auth.uid());
    END IF;
END
$$;

-- Service role can access all (for AI)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'service_role_preferences' AND tablename = 'guest_preferences'
    ) THEN
        CREATE POLICY "service_role_preferences" ON guest_preferences
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'service_role_memory' AND tablename = 'guest_memory'
    ) THEN
        CREATE POLICY "service_role_memory" ON guest_memory
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END
$$;

-- =============================================================================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- =============================================================================
CREATE OR REPLACE FUNCTION update_guest_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_guest_preferences_timestamp ON guest_preferences;
CREATE TRIGGER update_guest_preferences_timestamp
    BEFORE UPDATE ON guest_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_guest_preferences_timestamp();
