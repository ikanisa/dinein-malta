-- Helper function to create an admin user
-- This function should be called by a super-admin or via Supabase Dashboard
-- 
-- Usage example (run in Supabase SQL Editor after creating auth user):
-- SELECT create_admin_user('user-uuid-from-auth-users-table');

CREATE OR REPLACE FUNCTION public.create_admin_user(p_auth_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO v_admin_id
  FROM public.admin_users
  WHERE auth_user_id = p_auth_user_id;

  IF v_admin_id IS NOT NULL THEN
    -- Update existing admin user to active
    UPDATE public.admin_users
    SET is_active = true,
        updated_at = now()
    WHERE id = v_admin_id;
    RETURN v_admin_id;
  ELSE
    -- Create new admin user
    INSERT INTO public.admin_users (auth_user_id, role, is_active)
    VALUES (p_auth_user_id, 'admin', true)
    RETURNING id INTO v_admin_id;
    RETURN v_admin_id;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.create_admin_user IS 'Creates or activates an admin user. Requires auth_user_id from auth.users table.';


