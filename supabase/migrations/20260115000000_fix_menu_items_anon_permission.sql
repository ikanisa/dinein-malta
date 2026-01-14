-- ==========================================
-- FIX: menu_items Permission Denied for Anonymous Users
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Grant SELECT permission on menu_items to anon role
GRANT SELECT ON public.menu_items TO anon;

-- 2. Create RLS policy to allow anonymous users to see available menu items
DROP POLICY IF EXISTS "menu_items_anon_select_active" ON public.menu_items;
CREATE POLICY "menu_items_anon_select_active"
ON public.menu_items FOR SELECT
USING (
  is_available = true 
  AND EXISTS (
    SELECT 1 FROM public.vendors v 
    WHERE v.id = vendor_id 
    AND v.status = 'active'
  )
);

-- 3. Verify the policy was created
SELECT policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'menu_items';
