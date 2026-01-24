# DineIn Screen Coverage Matrix

**Date**: 2026-01-24
**Status**: ✅ All required screens exist

## Customer App (`apps/customer`)

| Screen | Route | Exists | States | Mobile | Notes |
|--------|-------|--------|--------|--------|-------|
| Venue Menu | `/v/{slug}` | ✅ | L/E | ✅ | Deep link entry |
| Cart | `/v/{slug}/cart` | ✅ | L/E | ✅ | EmptyState used |
| Checkout | `/v/{slug}/checkout` | ✅ | L/E | ✅ | Payment handoff |
| Order Status | `/order/{id}` | ✅ | L | ✅ | Realtime updates |
| Home | `/` | ✅ | L/E | ✅ | EmptyState used |
| Settings | `/settings` | ✅ | - | ✅ | Profile, history |

## Venue App (`apps/venue`)

| Screen | Route | Exists | States | Mobile | Notes |
|--------|-------|--------|--------|--------|-------|
| Login | `/login` | ✅ | L/E | ✅ | Auth gate |
| Dashboard | `/` | ✅ | L | ✅ | Overview |
| Orders Queue | `/orders` | ✅ | L/E | ✅ | Status tabs |
| Menu Manager | `/menu` | ✅ | L/E | ✅ | CRUD |
| Ingest Menu | `/ingest` | ✅ | L | ✅ | OCR staging |
| Claim Venue | `/claim` | ✅ | L | ✅ | Claim flow |

## Admin App (`apps/admin`)

| Screen | Route | Exists | States | Mobile | Notes |
|--------|-------|--------|--------|--------|-------|
| Login | `/login` | ✅ | L/E | ✅ | Auth gate |
| Dashboard | `/` | ✅ | L | ✅ | Overview |
| Claims | `/claims` | ✅ | L/E | ✅ | Approve/Reject |
| Venues | `/venues` | ✅ | L | ✅ | Venue list |

## Legend
- **L**: Loading state
- **E**: Empty state
- **✅**: Present/Verified

## Journey Verification

### Customer Journey (≤4 taps) ✅
1. Open `/v/{slug}` (deep link) → Menu
2. Tap item → Add to cart (1 tap)
3. Cart pill → Open cart (2 taps)
4. Checkout button (3 taps)
5. Place Order (4 taps)

**Result**: 4 taps from menu to placed order ✅

### Venue Journey ✅
1. Login → Dashboard
2. Orders tab → Order detail
3. Mark Received → Mark Served

### Admin Journey ✅
1. Login → Dashboard
2. Claims → Claim detail
3. Approve/Reject
