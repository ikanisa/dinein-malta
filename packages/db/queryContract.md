# DineIn Query Contract

> Single source of truth for Supabase data access patterns.

## Public Read Endpoints (Customer)

### A) `getVenueBySlug(slug)` ✅
**File**: `packages/db/src/queries/venue.ts`
- **Input**: `slug: string`
- **Returns**: `Venue | null`
- **Fields**: id, name, slug, country, momo_code, revolut_link, created_at

### B) `getFullMenu(venueId)` ✅
**File**: `packages/db/src/queries/venue.ts`
- **Input**: `venueId: string`
- **Returns**: `{ categories: MenuCategory[]; items: MenuItem[] }`
- **Optimization**: 2 parallel queries via `Promise.all`

### C) `getVenuesForCountry(country, page)` ⚠️ NEEDS IMPLEMENTATION
- **Input**: `country: 'RW' | 'MT'`, `page?: number`
- **Returns**: `{ venues: Venue[]; hasMore: boolean }`
- **Pagination**: 10 per page

## Authenticated Endpoints

### D) `createOrder(payload)` ✅
**File**: `packages/db/src/queries/order.ts`
- Uses Edge Function `order_create`
- Calculates total from items
- Returns created Order

### E) `getRecentOrders(venueId, limit)` ✅
- Returns orders for venue, limited

### F) `subscribeToOrder(orderId, onUpdate)` ✅
- Realtime subscription for status updates

## Missing Queries (To Implement)
- [ ] `getVenuesForCountry` - paginated discovery
- [ ] `getOrdersForVenue(venueId, status)` - venue portal orders queue
- [ ] `getPendingClaims()` - admin claims list

## Optimization Notes
- Current queries use `select('*')` - acceptable for MVP
- Indexes exist per migration `20250119000000_performance_indexes.sql`
- RLS hardened in migration `20260114100000_rls_hardening_complete.sql`
