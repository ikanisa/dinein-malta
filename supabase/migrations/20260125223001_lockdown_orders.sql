-- Revoke direct access from anon/active_user on orders
-- We are moving to an Edge Function based write model for security

-- Helper to safely revoke if permissions exist
do $$
begin
  -- Revoke INSERT on orders from anon and authenticated (if they had it)
  revoke insert on table public.orders from anon;
  revoke insert on table public.orders from authenticated;

  -- Revoke INSERT on bell_requests
  revoke insert on table public.bell_requests from anon;
  revoke insert on table public.bell_requests from authenticated;
  
  -- Revoke UPDATE on orders (Customers shouldn't directly update statuses anyway)
  revoke update on table public.orders from anon;
  -- Keep authenticated update if staff needs it? 
  -- Assuming staff uses a different role or strict RLS. 
  -- For now, we focus on blocking 'anon' abuse.
  
end $$;

-- Verify RLS is enabled
alter table public.orders enable row level security;
alter table public.bell_requests enable row level security;
