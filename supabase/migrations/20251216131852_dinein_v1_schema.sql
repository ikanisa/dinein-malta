-- DineIn Malta (v1) - Minimal schema + RLS (fixed order)
create extension if not exists pgcrypto;

-- Enums
do $$ begin
  create type public.vendor_role as enum ('owner','manager','staff');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.vendor_status as enum ('pending','active','suspended');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_status as enum ('received','served','cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum ('unpaid','paid');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.reservation_status as enum ('pending','accepted','declined','cancelled');
exception when duplicate_object then null;
end $$;

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- TABLES (create first)

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique,
  role text not null default 'admin',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_admin_users_updated_at on public.admin_users;
create trigger trg_admin_users_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  country text not null default 'MT',
  google_place_id text not null unique,
  slug text not null unique,
  name text not null,
  address text,
  lat double precision,
  lng double precision,
  hours_json jsonb,
  photos_json jsonb,
  website text,
  phone text,
  revolut_link text,
  whatsapp text,
  status public.vendor_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vendors_country_mt_chk check (country = 'MT')
);
create index if not exists idx_vendors_status on public.vendors(status);

drop trigger if exists trg_vendors_updated_at on public.vendors;
create trigger trg_vendors_updated_at
before update on public.vendors
for each row execute function public.set_updated_at();

create table if not exists public.vendor_users (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  auth_user_id uuid not null,
  role public.vendor_role not null default 'staff',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(vendor_id, auth_user_id)
);
create index if not exists idx_vendor_users_vendor_id on public.vendor_users(vendor_id);
create index if not exists idx_vendor_users_auth_user_id on public.vendor_users(auth_user_id);

drop trigger if exists trg_vendor_users_updated_at on public.vendor_users;
create trigger trg_vendor_users_updated_at
before update on public.vendor_users
for each row execute function public.set_updated_at();

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  category text,
  name text not null,
  description text,
  price numeric(12,2) not null default 0,
  currency text not null default 'EUR',
  is_available boolean not null default true,
  tags_json jsonb,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint menu_items_currency_eur_chk check (currency = 'EUR')
);
create index if not exists idx_menu_items_vendor_id on public.menu_items(vendor_id);

drop trigger if exists trg_menu_items_updated_at on public.menu_items;
create trigger trg_menu_items_updated_at
before update on public.menu_items
for each row execute function public.set_updated_at();

create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  table_number int not null,
  label text not null,
  public_code text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(vendor_id, table_number),
  unique(vendor_id, public_code)
);
create index if not exists idx_tables_vendor_id on public.tables(vendor_id);

drop trigger if exists trg_tables_updated_at on public.tables;
create trigger trg_tables_updated_at
before update on public.tables
for each row execute function public.set_updated_at();

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  table_id uuid references public.tables(id) on delete set null,
  client_auth_user_id uuid not null,
  order_code text not null,
  status public.order_status not null default 'received',
  payment_status public.payment_status not null default 'unpaid',
  total_amount numeric(12,2) not null default 0,
  currency text not null default 'EUR',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_currency_eur_chk check (currency = 'EUR')
);
create index if not exists idx_orders_vendor_created on public.orders(vendor_id, created_at desc);
create index if not exists idx_orders_client_user on public.orders(client_auth_user_id);

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  name_snapshot text not null,
  price_snapshot numeric(12,2) not null default 0,
  qty int not null default 1,
  modifiers_json jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_order_items_order_id on public.order_items(order_id);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  client_auth_user_id uuid not null,
  datetime timestamptz not null,
  party_size int not null default 1,
  notes text,
  status public.reservation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_reservations_vendor_datetime on public.reservations(vendor_id, datetime);

drop trigger if exists trg_reservations_updated_at on public.reservations;
create trigger trg_reservations_updated_at
before update on public.reservations
for each row execute function public.set_updated_at();

-- HELPER FUNCTIONS (after tables)

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.auth_user_id = auth.uid()
      and au.is_active = true
  );
$$;

create or replace function public.is_vendor_member(p_vendor_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.vendor_users vu
    where vu.vendor_id = p_vendor_id
      and vu.auth_user_id = auth.uid()
      and vu.is_active = true
  );
$$;

create or replace function public.vendor_role_for(p_vendor_id uuid)
returns public.vendor_role
language sql
stable
security definer
set search_path = public
as $$
  select vu.role
  from public.vendor_users vu
  where vu.vendor_id = p_vendor_id
    and vu.auth_user_id = auth.uid()
    and vu.is_active = true
  limit 1;
$$;

create or replace function public.can_edit_vendor_profile(p_vendor_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
     or public.vendor_role_for(p_vendor_id) in ('owner','manager');
$$;

create or replace function public.can_manage_vendor_ops(p_vendor_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
     or public.is_vendor_member(p_vendor_id);
$$;

-- RLS + POLICIES
alter table public.admin_users enable row level security;
alter table public.vendors enable row level security;
alter table public.vendor_users enable row level security;
alter table public.menu_items enable row level security;
alter table public.tables enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reservations enable row level security;

-- admin_users
drop policy if exists "admin_users_select" on public.admin_users;
create policy "admin_users_select"
on public.admin_users for select
using (public.is_admin());

drop policy if exists "admin_users_write" on public.admin_users;
create policy "admin_users_write"
on public.admin_users for all
using (public.is_admin())
with check (public.is_admin());

-- vendors
drop policy if exists "vendors_select" on public.vendors;
create policy "vendors_select"
on public.vendors for select
using (status = 'active' or public.is_admin() or public.is_vendor_member(id));

drop policy if exists "vendors_update" on public.vendors;
create policy "vendors_update"
on public.vendors for update
using (public.can_edit_vendor_profile(id))
with check (public.can_edit_vendor_profile(id));

drop policy if exists "vendors_insert_admin_only" on public.vendors;
create policy "vendors_insert_admin_only"
on public.vendors for insert
with check (public.is_admin());

drop policy if exists "vendors_delete_admin_only" on public.vendors;
create policy "vendors_delete_admin_only"
on public.vendors for delete
using (public.is_admin());

-- vendor_users
drop policy if exists "vendor_users_select" on public.vendor_users;
create policy "vendor_users_select"
on public.vendor_users for select
using (public.is_admin() or public.is_vendor_member(vendor_id) or auth.uid() = auth_user_id);

drop policy if exists "vendor_users_write" on public.vendor_users;
create policy "vendor_users_write"
on public.vendor_users for all
using (public.is_admin() or public.vendor_role_for(vendor_id) in ('owner','manager'))
with check (public.is_admin() or public.vendor_role_for(vendor_id) in ('owner','manager'));

-- menu_items
drop policy if exists "menu_items_select" on public.menu_items;
create policy "menu_items_select"
on public.menu_items for select
using (
  public.is_admin()
  or public.is_vendor_member(vendor_id)
  or exists (select 1 from public.vendors v where v.id = vendor_id and v.status = 'active')
);

drop policy if exists "menu_items_write" on public.menu_items;
create policy "menu_items_write"
on public.menu_items for all
using (public.can_edit_vendor_profile(vendor_id))
with check (public.can_edit_vendor_profile(vendor_id));

-- tables (vendor/admin only)
drop policy if exists "tables_select" on public.tables;
create policy "tables_select"
on public.tables for select
using (public.can_manage_vendor_ops(vendor_id));

drop policy if exists "tables_write" on public.tables;
create policy "tables_write"
on public.tables for all
using (public.can_edit_vendor_profile(vendor_id))
with check (public.can_edit_vendor_profile(vendor_id));

-- orders
drop policy if exists "orders_select" on public.orders;
create policy "orders_select"
on public.orders for select
using (public.is_admin() or public.is_vendor_member(vendor_id) or client_auth_user_id = auth.uid());

drop policy if exists "orders_insert_client" on public.orders;
create policy "orders_insert_client"
on public.orders for insert
with check (client_auth_user_id = auth.uid());

drop policy if exists "orders_update_vendor" on public.orders;
create policy "orders_update_vendor"
on public.orders for update
using (public.is_admin() or public.is_vendor_member(vendor_id))
with check (public.is_admin() or public.is_vendor_member(vendor_id));

-- order_items
drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select"
on public.order_items for select
using (
  public.is_admin()
  or exists (select 1 from public.orders o where o.id = order_id and public.is_vendor_member(o.vendor_id))
  or exists (select 1 from public.orders o where o.id = order_id and o.client_auth_user_id = auth.uid())
);

drop policy if exists "order_items_insert" on public.order_items;
create policy "order_items_insert"
on public.order_items for insert
with check (exists (select 1 from public.orders o where o.id = order_id and o.client_auth_user_id = auth.uid()));

-- reservations
drop policy if exists "reservations_select" on public.reservations;
create policy "reservations_select"
on public.reservations for select
using (public.is_admin() or public.is_vendor_member(vendor_id) or client_auth_user_id = auth.uid());

drop policy if exists "reservations_insert_client" on public.reservations;
create policy "reservations_insert_client"
on public.reservations for insert
with check (client_auth_user_id = auth.uid());

drop policy if exists "reservations_update_vendor" on public.reservations;
create policy "reservations_update_vendor"
on public.reservations for update
using (public.is_admin() or public.is_vendor_member(vendor_id))
with check (public.is_admin() or public.is_vendor_member(vendor_id));
