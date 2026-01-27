---
description: 
---

---
name: /flutter-data-layer-supabase-no-auth
description: Implements the Flutter app’s data layer using Supabase (read: venues/menus/promos; write: orders/bell) without requiring customer login. Includes repository pattern, DTOs, caching, and secure write strategy (Edge Functions / RLS-safe inserts).
---

# /flutter-data-layer-supabase-no-auth (Customer Flutter App)

## 0) Scope lock (non-negotiable)
This workflow creates:
- Supabase client setup in Flutter
- repositories for reading venues/menus/promos
- a safe write path for creating orders and bell rings without customer auth
- caching layer (local) for fast UX
- clear security rules (RLS + service role only where needed)

It must NOT:
- add customer signup/login/OTP
- add payment verification or payment APIs
- add maps/location
- change UI journeys

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Flutter data layer (Supabase, no-auth)"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Dependencies (standard)
Add and pin:
- supabase_flutter (Supabase client)
- dio OR http (choose one; prefer dio if you want interceptors)
- flutter_secure_storage (for storing anon session id if needed)
- hive OR shared_preferences (choose one; prefer hive for structured cache)
- riverpod (or your chosen state mgmt; keep consistent)

Document versions in:
- /docs/flutter_customer/deps.md

---

## 3) Identity model (no login, still consistent)
Define:
- session_id (UUID) created on first launch
- stored locally (secure or normal storage)
- rotates on “Clear suggestions history” (if you implement personalization)

Optional profile fields (Settings only):
- display_name
- whatsapp_number (stored locally and optionally synced if you decide)

Hard rule:
- app features must work without these fields.

---

## 4) Data access strategy (choose ONE and implement)
### Option A (recommended): Edge Functions as the write gateway
- Reads can be direct via Supabase (with public RLS)
- Writes (create order, ring bell) go through Edge Functions using service role
- Edge Functions validate payload + enforce limits + prevent abuse

### Option B: Direct inserts with strict RLS policies
- allow anon inserts only into limited tables with strict constraints
- higher risk; only choose if you fully trust RLS design and anti-abuse

Default: Option A.

Document the choice in:
- /docs/flutter_customer/security_model.md

---

## 5) Repositories (must implement)
Create in:
- apps/flutter_customer/lib/core/data/

### 5.1 Models/DTOs
- venue.dart (id, name, country, specialties, amenities, payment_method fields)
- menu.dart (venue_id, categories)
- menu_item.dart (id, name, price, tags)
- promo.dart
- order.dart (id, status, totals, payment_method, created_at)
- bell_request.dart (venue_id, table_number, created_at)

### 5.2 Repositories
- venue_repository.dart
  - listVenues(country, cursor?, limit)
  - getVenueBySlug(slug)
  - searchVenues(country, query)
- menu_repository.dart
  - getActiveMenu(venueId)
  - listMenuItems(venueId, categoryId?)
- promo_repository.dart
  - listPromos(country, venueId?)
- order_repository.dart
  - createOrder(payload) (via Edge Function)
  - listOrdersLocal() (local cache for order history)
  - refreshOrderStatus(orderId) (read-only)
- bell_repository.dart
  - ringBell(venueId, tableNumber) (via Edge Function)

All repositories must:
- return typed results
- handle offline fallback from cache
- enforce country scoping from venue.country

---

## 6) Local caching (must implement)
Choose:
- Hive (recommended) for structured caching

Cache requirements:
- venues list cache per country
- venue-by-slug cache
- menu cache per venue (with expires)
- promos per country/venue

TTL suggestions:
- venues: 1–6 hours
- menu: 10–60 minutes (depending on expected updates)
- promos: 30–60 minutes

Stale-while-revalidate:
- show cached immediately
- refresh in background on screen focus

---

## 7) Supabase setup (Flutter)
Create:
- apps/flutter_customer/lib/core/data/supabase/supabase_client.dart
- initialize in main.dart

Rules:
- Supabase URL + anon key from env config (not hardcoded)
- do not ship service role key in the app
- set timeouts and error handling

---

## 8) Edge Functions (write gateway) — payload contract
Create these functions (names are examples):
- create_customer_order
- ring_bell

Payload must include:
- session_id
- venue_id
- cart items [{item_id, qty}]
- payment_method: cash|momo_ussd|revolut_link
- table_number (optional depending on your flow)
- country (derived from venue server-side)

Server validations:
- venue exists and is active
- items belong to venue
- qty limits (e.g., max 20 items)
- rate limit by session_id/IP
- status starts as “received”
- no payment verification logic

Return:
- order_id
- created_at
- status

Log:
- request hash, outcome, latency

---

## 9) RLS (must be safe)
Reads:
- public read policies for venues and menus, country-scoped if needed

Writes:
- if using Edge Functions, restrict direct client inserts
- Edge Functions use service role to write safely

Orders visibility:
- without auth, customer can only see:
  - orders stored locally in app (order history)
  - optionally, server can allow order status read by order_id + session_id token (if you implement)
Keep it simple in v1:
- store order ids locally and read status by id via a safe read policy or function.

Document in:
- /docs/flutter_customer/orders_visibility.md

---

## 10) Error handling & UX contract
Repositories must expose:
- loading
- cached data available
- network error
- retry action

Never block core flows:
- if promos fail, home still loads
- if menu refresh fails, show cached menu

---

## 11) Testing & verification
Unit tests:
- DTO serialization
- cache read/write
- repository fallback logic

Integration test (dev environment):
- getVenueBySlug works
- getActiveMenu works
- create_customer_order returns order_id
- ring_bell returns success

---

## 12) Acceptance criteria (measurable)
- Flutter app can list venues and open venue menu without login
- menu loads with cache fallback
- order create works via Edge Function (no service key in app)
- bell ring works via Edge Function
- repos are typed and testable
- /scope-guard passes

---

## 13) Verification evidence
Provide:
- files changed (paths)
- edge function names + payload schema
- RLS summary (high level)
- sample responses (sanitized)
- tests run (commands + results)
- /scope-guard pass/fail

---

## 14) Output format (mandatory)
At end, output:
- Files changed (paths)
- Data model summary
- Cache strategy summary
- Next workflow recommendation: /flutter-home-venue-discovery
- /scope-guard pass/fail
