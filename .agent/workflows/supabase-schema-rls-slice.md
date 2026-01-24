---
description: 
---

---
name: /supabase-schema-rls-slice
description: Creates the complete Supabase schema for DineIn (customer/venue/admin), enables RLS, adds indexes, seeds demo data for RW/MT, and validates policies with positive+negative checks. Mobile-first PWAs depend on this.
---

# /supabase-schema-rls-slice

## 0) Scope (hard-locked)
This workflow creates/updates database schema, RLS policies, indexes, and seed data.
Must NOT introduce:
- delivery concepts, maps/location, payment APIs/verification, in-app scanning, extra statuses.

Statuses allowed:
- Order: Placed, Received, Served, Cancelled

Country:
- RW, MT only.

---

## 1) Preconditions
- Supabase project exists (local or remote)
- Supabase CLI installed (or equivalent workflow)
- Repo has a `supabase/` directory OR will create it

If not present, scaffold Supabase local setup minimally and STOP for review.

---

## 2) Kickoff (mandatory)
Run: /kickoff with scope: "Supabase schema + RLS slice"
Output must include:
- Scope lock + exclusions
- Plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 3) Schema (tables required)
Create these tables (minimum viable) with clean types and constraints:

### 3.1 Reference
- countries:
  - id (RW, MT)
  - name
  - currency (RWF, EUR)
  - created_at

### 3.2 Auth/profile
- profiles:
  - user_id (pk, references auth.users)
  - display_name (nullable)
  - whatsapp (nullable)
  - active_country (RW|MT nullable)
  - is_admin boolean default false
  - is_disabled boolean default false
  - created_at, updated_at

### 3.3 Venue domain
- venues:
  - id uuid pk
  - slug unique
  - name
  - country_id references countries(id)
  - status enum: Active|Disabled (or boolean active)
  - owner_user_id uuid nullable (references auth.users)
  - whatsapp nullable
  - momo_code nullable (RW only)
  - revolut_link nullable (MT only)
  - amenities text[] default {}
  - specialities text[] default {}
  - created_at, updated_at

- venue_claims:
  - id uuid pk
  - venue_id references venues(id)
  - user_id references auth.users(id)
  - status enum: Pending|Approved|Rejected
  - submitted_at
  - reviewed_at nullable
  - reviewed_by nullable (admin user id)
  - unique constraint: one pending claim per (venue_id, user_id) OR enforce via policy

### 3.4 Menus
- menus:
  - id uuid pk
  - venue_id references venues(id)
  - version int
  - is_active boolean
  - created_at

- menu_categories:
  - id uuid pk
  - menu_id references menus(id)
  - name
  - sort int default 0

- menu_items:
  - id uuid pk
  - category_id references menu_categories(id)
  - name
  - description nullable
  - price numeric(12,2)
  - currency (derive from country; store snapshot string)
  - available boolean default true
  - sort int default 0

### 3.5 Orders + bell
- orders:
  - id uuid pk
  - venue_id references venues(id)
  - user_id nullable (auth.users)
  - table_no nullable text
  - status enum: Placed|Received|Served|Cancelled
  - pay_method enum: Cash|MoMoUSSD|RevolutLink
  - total numeric(12,2)
  - created_at

- order_items:
  - id uuid pk
  - order_id references orders(id)
  - item_id references menu_items(id)
  - qty int
  - price_snapshot numeric(12,2)
  - name_snapshot text (optional but recommended)
  - notes nullable text

- bell_calls:
  - id uuid pk
  - venue_id references venues(id)
  - table_no text
  - note nullable text
  - status enum: New|Ack|Cleared
  - created_at

### 3.6 Promotions (optional but recommended)
- promotions:
  - id uuid pk
  - venue_id references venues(id)
  - title text
  - body text
  - active_from nullable
  - active_to nullable
  - is_active boolean default true
  - created_at

### 3.7 Audit (admin actions)
- audit_events:
  - id uuid pk
  - actor_id references auth.users(id)
  - action text (enum-like constraint recommended)
  - entity_type text
  - entity_id uuid
  - metadata jsonb default '{}'::jsonb
  - created_at

---

## 4) RLS (must be enabled + tested)
Enable RLS on all tables except countries (optional).

### 4.1 Public read rules (anonymous allowed)
Allow read for:
- venues where status=Active
- active menu + categories + items
- promotions where is_active=true
No write access.

### 4.2 Authenticated customer rules
- profiles:
  - user can read/write their own profile (except is_admin, is_disabled)
- orders:
  - authenticated user can read their own orders
  - can create order (if allowed) with user_id = auth.uid()
- favorites (if added later) user-owned

### 4.3 Venue owner rules
Owner definition:
- venues.owner_user_id = auth.uid()

Owner can:
- update their venue fields (except country_id, owner_user_id)
- manage menus/categories/items for their venue
- read/update orders for their venue (status changes)
- read/update bell_calls for their venue
- create promotions for their venue

### 4.4 Admin rules
Admin definition:
- profiles.is_admin = true

Admin can:
- approve/reject claims (venue_claims)
- assign/reassign owner_user_id (venues)
- disable venues/users
- write audit_events
- read everything needed for moderation

### 4.5 Explicit denials / anti-escalation
- users cannot set is_admin on themselves
- venue owners cannot set owner_user_id or country_id
- public cannot write anything

---

## 5) Indexes (RLS + performance)
Add indexes that matter:
- venues(country_id, status)
- venues(slug unique)
- venues(owner_user_id)
- venue_claims(status, venue_id)
- menus(venue_id, is_active)
- menu_categories(menu_id, sort)
- menu_items(category_id, available, sort)
- orders(venue_id, created_at desc)
- orders(user_id, created_at desc)
- bell_calls(venue_id, status, created_at desc)
- audit_events(created_at desc, actor_id)

If implementing fuzzy venue search:
- enable pg_trgm
- create gin index on venues.name (or name + slug)

---

## 6) Seed data (must exist for demos)
Seed at minimum:
- countries: RW (RWF), MT (EUR)
- 4 venues in RW + 4 venues in MT (Active)
- each venue: active menu with 3 categories and 8–12 items
- one RW venue with momo_code; one MT venue with revolut_link
- 2 promos per country
- optional sample orders + bell calls for one demo venue

Seed must avoid real phone numbers/emails.

---

## 7) Local dev flow (deterministic)
Provide commands/instructions in repo docs:
- start supabase local
- apply migrations
- seed data
- generate types for packages/db
- run each app against local supabase

Never print secrets; document env var names only.

---

## 8) Verification (required evidence)
### 8.1 Policy tests (must include negative cases)
Manually or via scripted SQL tests verify:
- anonymous can read active venues/menus
- anonymous cannot write orders/venues
- authenticated user can update own profile but not is_admin
- non-owner cannot update a venue or change order status
- owner can update own venue + menu + orders + bell_calls
- admin can approve claim and assign owner
- already-owned venue cannot be approved to a different owner without reassign action

### 8.2 App sanity check
- customer app: /v/{slug} loads menu from DB
- venue app: owner can edit and status-update orders
- admin app: can approve claims and see audit logs

Evidence required:
- migrations list
- seed confirmation output
- RLS verification notes (pass/fail)
- indexes created

---

## 9) Output format (mandatory)
At end, output:
- Migrations created (paths)
- Policies summary (table by table)
- Indexes summary
- Seed summary (what data exists)
- Commands to reproduce locally
- Known gaps + next workflow recommendation
- Run /scope-guard pass/fail

