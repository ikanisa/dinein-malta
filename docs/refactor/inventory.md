# DineIn Refactor — Codebase Inventory

> **Phase A Deliverable** — Baseline & Inventory (no code changes)  
> Generated: 2026-01-24

---

## 1. Apps

### apps/customer
**Entry:** `/` (Home), `/v/:slug` (deep link → venue menu)  
**Routes:**
| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Home | Venue discovery + promos |
| `/settings` | Settings | Profile, history, favorites |
| `/v/:slug` | VenueMenu | Menu view for scanned venue |
| `/v/:slug/cart` | Cart | Shopping cart |
| `/v/:slug/checkout` | Checkout | Order placement |
| `/v/:slug/orders/:orderId` | OrderStatus | Order tracking |

**State:**
- `useCartStore.ts` (Zustand) — cart items, add/remove, totals

**Data Fetching:**
- `hooks/useVenue.ts` — fetch venue by slug
- `hooks/useOrder.ts` — order status polling
- Direct Supabase client calls in pages

**Pain Points:**
- Cart store has type inconsistencies (id as number vs string UUID)
- index.css duplicated (36KB) from venue/admin
- No shared data-fetching layer — each page does its own Supabase calls
- A2HS prompt appears too early (on mount, not after engagement)

---

### apps/venue
**Entry:** `/` (Login)  
**Routes:**
| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Login | Venue owner auth |
| `/claim` | Claim | New venue claim flow |
| `/dashboard` | DashboardLayout | Nested routes |
| `/dashboard/orders` | OrdersQueue | KDS for incoming orders |
| `/dashboard/menu` | MenuManager | Menu CRUD |
| `/dashboard/ingest/:jobId` | IngestMenu | OCR review pipeline |

**State:**
- `context/OwnerContext.tsx` — auth state, venue ID

**Data Fetching:**
- `hooks/useCategories.ts` — menu categories
- `hooks/useMenuItems.ts` — menu items CRUD
- `hooks/useOrders.ts` — realtime orders
- `hooks/useServiceRequests.ts` — bell/waiter calls
- `hooks/useVendorStats.ts` — dashboard stats

**Pain Points:**
- `design-system/` folder duplicates tokens already in `packages/ui/tokens`
- `shared/` folder with 9 files overlaps with packages/ui
- `stories/` folder for Storybook but not integrated in CI
- Large MenuManager.tsx (12KB) — could split into smaller components

---

### apps/admin
**Entry:** `/` (Login)  
**Routes:**
| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Login | Admin auth |
| `/dashboard` | AdminLayout | Nested routes |
| `/dashboard/claims` | Claims | Approve/reject venue claims |
| `/dashboard/venues` | Venues | Venue management |
| `/dashboard/users` | Placeholder | User list (not implemented) |
| `/dashboard/audit` | Placeholder | Audit logs (not implemented) |

**State:**
- `context/AdminContext.tsx` — admin auth state

**Data Fetching:**
- `hooks/useAdmin.ts` — admin-specific queries

**Pain Points:**
- `design-system/` and `shared/` folders duplicate venue app structure
- Two placeholder routes not implemented
- index.css duplicated (36KB)
- No dedicated claim approval edge function integration

---

## 2. Packages

### packages/ui
**Purpose:** Shared UI primitives, tokens, and components  
**Exports:** 24 components via `src/components/ui/`

| Component | Status | Notes |
|-----------|--------|-------|
| Button | ✅ | CVA variants, loading state |
| Card / GlassCard | ✅ | Glass morphism |
| Dialog | ✅ | Radix-based |
| BottomSheet | ✅ | Mobile sheet |
| DraggableBottomSheet | ✅ | Gesture-enabled |
| EmptyState | ✅ | Configurable icon/message |
| ErrorBoundary | ✅ | Full-page fallback |
| Skeleton | ✅ | Loading placeholder |
| Input / SearchBar | ✅ | Form primitives |
| Badge / Bell | ✅ | Notifications |
| FAB / StickyCTA | ✅ | Mobile CTAs |
| FadeIn / PageTransition / StaggerList | ✅ | Motion primitives |
| SwipeableListItem | ✅ | Gesture actions |
| VenueCard / MenuItemCard | ✅ | Domain widgets |
| microcopy.ts | ✅ | Centralized strings |
| theme-toggle.tsx | ✅ | Dark mode toggle |

**Dependencies:** Radix UI, framer-motion, sonner, CVA

**Pain Points:**
- Components not consistently used across all 3 apps
- Apps duplicate Radix UI dependencies in their own package.json
- Tokens in `packages/ui/src/tokens/` but apps also have local `design-system/` folders

---

### packages/core
**Purpose:** Domain logic, types, constants (single source of truth)  
**Exports:**
- `OrderStatus` type + labels + flow helpers
- `PaymentMethod` type + labels
- `CountryCode` + `Country` type + helpers
- `microcopy` constants

**Status:** ✅ Well-structured, follows STARTER RULES

**Pain Points:**
- Not all apps import types from here consistently
- `country.ts` file has some overlap with index.ts exports

---

### packages/db
**Purpose:** Supabase types and data-access helpers  
**Exports:**
- Type definitions for Venue, MenuCategory, MenuItem, Order, etc.
- Mock data (MOCK_VENUES, MOCK_CATEGORIES, MOCK_ITEMS)
- `mockPlaceOrder` function

**Pain Points:**
- Still using **mock data** instead of real Supabase queries
- No typed query helpers (e.g., `getVenueBySlug`, `createOrder`)
- Apps make direct Supabase calls instead of using this package
- Types not auto-generated from Supabase schema

---

### packages/commons
**Purpose:** Unknown — appears empty or minimal  
**Status:** 2 files only, unclear purpose

---

## 3. Backend (Supabase)

### Migrations (39 files)
Key migrations:
| File | Purpose |
|------|---------|
| `20251216131852_dinein_v1_schema.sql` | Initial schema (13KB) |
| `20250116000001_harden_rls_policies.sql` | RLS hardening |
| `20260114200000_fix_rate_limit_anonymous.sql` | Rate limiting |
| `20260124000000_enable_rls_missing_tables.sql` | RLS completion |
| `20260124140000_align_status_and_country.sql` | Status/country alignment |
| `20260125000000_bar_onboarding_schema.sql` | Onboarding tables |

### Edge Functions (18 functions)
| Function | Purpose |
|----------|---------|
| `order_create` | Create order (RPC) |
| `order_update_status` | Status transition |
| `order_mark_paid` | Payment confirmation |
| `vendor_claim` | Venue claim submission |
| `admin_approve_onboarding` | Claim approval |
| `menu_ocr_parse` | OCR menu parsing |
| `tables_generate` | Table QR generation |
| `bar_search` | Venue search |
| `send_order` | Order notification |
| `create_payment_intent` | Payment (scope violation?) |
| `momo_charge` | MoMo API (scope violation?) |
| `revolut_charge` | Revolut API (scope violation?) |

> [!WARNING]  
> `create_payment_intent`, `momo_charge`, `revolut_charge` may violate STARTER RULES (no payment API integrations)

### Storage Buckets
- `venue_images` — venue photos

---

## 4. Dependency Map (imports)

```
apps/customer → packages/ui, packages/db, packages/core
apps/venue   → packages/ui, packages/db, packages/core
apps/admin   → packages/ui, packages/db, packages/core

packages/ui  → packages/core (for types)
packages/db  → (standalone, Supabase client only)
packages/core → (standalone, no deps)
```

---

## 5. Hot Paths (Top 3 Critical Journeys)

1. **Customer: QR → Menu → Cart → Checkout → Order**
   - Entry: `/v/{slug}` deep link
   - Must work in ≤4 taps
   - Uses: useVenue, useCartStore, order_create edge function

2. **Venue: Login → Orders Queue → Status Update**
   - Entry: `/` login → `/dashboard/orders`
   - Real-time order updates
   - Uses: OwnerContext, useOrders, order_update_status

3. **Admin: Login → Claims → Approve/Reject**
   - Entry: `/` login → `/dashboard/claims`
   - Uses: AdminContext, admin hooks, admin_approve_onboarding

---

## 6. File Counts

| Area | Files | Notes |
|------|-------|-------|
| apps/customer/src | 54 | Smallest app |
| apps/venue/src | 94 | Largest (menu mgmt + KDS) |
| apps/admin/src | 82 | Mid-size |
| packages/ui/src | 51 | Good consolidation |
| packages/core/src | 3 | Well-scoped |
| packages/db/src | 2 | Needs expansion |
| supabase/migrations | 39 | Many incremental fixes |
| supabase/functions | 18 | Broad coverage |
