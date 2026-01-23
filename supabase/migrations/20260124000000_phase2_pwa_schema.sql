-- Phase 2 PWA Schema Updates

-- Enable PostGIS for geospatial queries
create extension if not exists postgis;

-- 1. Venues: Add coordinates for efficient geospatial queries
alter table public.vendors add column if not exists coordinates geography(POINT);
create index if not exists idx_vendors_coordinates on public.vendors using GIST(coordinates);

-- Data migration: populate coordinates from lat/lng if they exist
update public.vendors
set coordinates = st_setsrid(st_make_point(lng, lat), 4326)::geography
where lat is not null and lng is not null;

-- 2. Orders: Allow anonymous orders and support takeout
alter table public.orders alter column client_auth_user_id drop not null;
alter table public.orders add column if not exists order_type text default 'dine_in'; 
-- (order_type values: 'dine_in', 'takeout')

-- 3. Reservations: Add contact details
alter table public.reservations add column if not exists contact_name text;
alter table public.reservations add column if not exists contact_phone text;
alter table public.reservations add column if not exists contact_email text;

-- 4. Create User Favorites
create table if not exists public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  venue_id uuid references public.vendors(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, venue_id)
);

alter table public.user_favorites enable row level security;

-- RLS for favorites
drop policy if exists "Users can manage their favorites" on public.user_favorites;
create policy "Users can manage their favorites"
  on public.user_favorites
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Helper for coordinates in menu/discovery
-- Function to search nearby venues
create or replace function public.search_nearby_venues(
  lat double precision,
  long double precision,
  radius_meters int default 5000
)
returns setof public.vendors
language sql
stable
as $$
  select *
  from public.vendors
  where st_dwithin(
    coordinates,
    st_setsrid(st_make_point(long, lat), 4326)::geography,
    radius_meters
  )
  and status = 'active'
  order by coordinates <-> st_setsrid(st_make_point(long, lat), 4326)::geography;
$$;
