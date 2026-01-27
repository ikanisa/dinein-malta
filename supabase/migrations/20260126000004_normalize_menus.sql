
BEGIN;

-- 0. Cleanup (Safe clean retry)
DROP TABLE IF EXISTS public.menu_categories CASCADE;
DROP TABLE IF EXISTS public.menus CASCADE;

-- 1. Create menus table
CREATE TABLE public.menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  version INT DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_menus_updated_at ON public.menus;
CREATE TRIGGER trg_menus_updated_at BEFORE UPDATE ON public.menus FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_menus_venue_active ON public.menus(venue_id, is_active);


-- 2. Create menu_categories table
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_menu_categories_updated_at ON public.menu_categories;
CREATE TRIGGER trg_menu_categories_updated_at BEFORE UPDATE ON public.menu_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_menu_categories_menu ON public.menu_categories(menu_id);

-- 3. Update menu_items to link to categories instead of just text
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.menu_categories(id) ON DELETE CASCADE;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- 4. Enable RLS
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

-- Menus Policies
CREATE POLICY "menus_read_public" ON public.menus FOR SELECT USING (is_active = true OR public.is_admin() OR public.is_venue_member(venue_id));
CREATE POLICY "menus_manage_owner" ON public.menus FOR ALL USING (public.is_admin() OR public.can_edit_venue(venue_id));

-- Categories Policies
CREATE POLICY "categories_read_public" ON public.menu_categories FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.menus m WHERE m.id = menu_id AND (m.is_active = true OR public.is_admin() OR public.is_venue_member(m.venue_id)))
);
CREATE POLICY "categories_manage_owner" ON public.menu_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.menus m WHERE m.id = menu_id AND (public.is_admin() OR public.can_edit_venue(m.venue_id)))
);

-- 5. Data Migration (Best Effort)
-- For each venue, create a default menu if none exists
DO $$
DECLARE
  v_rec RECORD;
  m_id UUID;
  cat_rec RECORD;
  c_id UUID;
BEGIN
  FOR v_rec IN SELECT id FROM public.venues LOOP
    -- Create default active menu
    INSERT INTO public.menus (venue_id, is_active) VALUES (v_rec.id, true) RETURNING id INTO m_id;
    
    -- For each distinct category string in menu_items for this venue
    FOR cat_rec IN SELECT DISTINCT category FROM public.menu_items WHERE venue_id = v_rec.id AND category IS NOT NULL LOOP
      -- Create category
      INSERT INTO public.menu_categories (menu_id, name) VALUES (m_id, cat_rec.category) RETURNING id INTO c_id;
      
      -- Link items
      UPDATE public.menu_items SET category_id = c_id WHERE venue_id = v_rec.id AND category = cat_rec.category;
    END LOOP;
  END LOOP;

END $$;

COMMIT;


-- 6. Cleanup (Optional, keeping old column for safety for now, or drop it?)
-- Ideally we drop 'category' text column, but apps might depend on it.
-- Let's keep it for now but make it nullable (it is nullable).
