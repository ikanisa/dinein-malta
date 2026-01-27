# DineIn Screen Coverage Matrix

**Date**: 2026-01-25  
**Status**: ✅ All required screens exist (100% coverage)

---

## Customer App (`apps/customer`)

| Screen | Route | Exists | Loading | Empty | Error | Mobile | E2e Tests | Notes |
|--------|-------|--------|---------|-------|-------|--------|-----------|-------|
| Home | `/` | ✅ | ✅ | ✅ | - | ✅ | ✅ | ListScreenTemplate |
| Venue Menu | `/v/{slug}` | ✅ | ✅ | ✅ | - | ✅ | ✅ | Deep link entry |
| Cart | `/v/{slug}/cart` | ✅ | - | ✅ | - | ✅ | - | EmptyState widget |
| Checkout | `/v/{slug}/checkout` | ✅ | ✅ | - | - | ✅ | - | Submitting state |
| Order Status | `/v/{slug}/orders/{id}` | ✅ | ✅ | - | ✅ | ✅ | - | Realtime updates |
| Settings | `/settings` | ✅ | - | - | - | ✅ | ✅ | Profile, history, A2HS |
| Offline Fallback | PWA | ✅ | - | - | - | ✅ | - | public/offline.html |

---

## Venue App (`apps/venue`)

| Screen | Route | Exists | Loading | Empty | Error | Mobile | E2e Tests | Notes |
|--------|-------|--------|---------|-------|-------|--------|-----------|-------|
| Login | `/` | ✅ | ✅ | - | ✅ | ✅ | - | Auth gate |
| Claim | `/claim` | ✅ | ✅ | ✅ | - | ✅ | - | Search + submit |
| Dashboard | `/dashboard` | ✅ | ✅ | - | - | ✅ | ✅ | Overview stats |
| Orders Queue | `/dashboard/orders` | ✅ | ✅ | ✅ | - | ✅ | ✅ | KDS + detail modal |
| Menu Manager | `/dashboard/menu` | ✅ | ✅ | ✅ | - | ✅ | - | CRUD operations |
| Ingest Menu | `/dashboard/ingest/:jobId` | ✅ | ✅ | - | - | ✅ | - | OCR staging |
| Settings | `/dashboard/settings` | ✅ | - | - | - | ✅ | - | Profile/Payments/QR tabs |

> **Note**: Bell notifications are in DashboardLayout header (BellNotifications component), not a separate page.

---

## Admin App (`apps/admin`)

| Screen | Route | Exists | Loading | Empty | Error | Mobile | E2e Tests | Notes |
|--------|-------|--------|---------|-------|-------|--------|-----------|-------|
| Login | `/` | ✅ | ✅ | - | ✅ | ✅ | - | Auth gate |
| Dashboard | `/dashboard` | ✅ | ✅ | - | - | ✅ | ✅ | Overview stats |
| Claims | `/dashboard/claims` | ✅ | ✅ | ✅ | - | ✅ | ✅ | Approve/Reject tabs |
| Venues | `/dashboard/venues` | ✅ | ✅ | ✅ | - | ✅ | - | Detail sheet |
| Menus | `/dashboard/menus` | ✅ | ✅ | ✅ | - | ✅ | - | Audit view |
| Users | `/dashboard/users` | ✅ | ✅ | ✅ | - | ✅ | - | User management |
| Audit Logs | `/dashboard/audit` | ✅ | ✅ | ✅ | - | ✅ | - | Activity logs |
| Settings | `/dashboard/settings` | ✅ | - | - | - | ✅ | - | Admin preferences |

---

## Legend
- **Loading**: Loading state (skeleton/spinner)
- **Empty**: Empty state (copy + action)  
- **Error**: Error state (copy + retry)
- **Mobile**: Mobile viewport verified
- **E2e Tests**: Playwright coverage

---

## Journey Verification

### Customer Journey (≤4 taps) ✅
1. Open `/v/{slug}` (deep link) → Menu
2. Tap item → Add to cart (1 tap)
3. Cart pill → Open cart (2 taps)
4. Checkout button (3 taps)
5. Place Order (4 taps)

**Result**: 4 taps from menu to placed order ✅

### Venue Journey ✅
1. Login at `/` → Dashboard
2. Orders tab → Order detail modal
3. Mark Received → Mark Served
4. Settings → Edit venue/Payment/QR

### Admin Journey ✅
1. Login at `/` → Dashboard
2. Claims → Claim detail sheet
3. Approve/Reject claim
4. Audit logs → View activity

---

## Scope Guard (Pass/Fail)

| Constraint | Status |
|------------|--------|
| No maps/location features | ✅ Pass |
| No payment API integrations | ✅ Pass |
| No in-app QR scanner | ✅ Pass |
| No delivery features | ✅ Pass |
| Customer 2-tab nav | ✅ Pass |
| `/v/{slug}` deep link | ✅ Pass |
| Ordering ≤4 taps | ✅ Pass |
| Only Placed/Received/Served/Cancelled | ✅ Pass |

---

## E2e Test Coverage Summary

| App | Test File | Coverage |
|-----|-----------|----------|
| Customer | `customer-flow.spec.ts` | Home, nav, tabs |
| Customer | `order-flow.spec.ts` | Menu, cart, checkout |
| Customer | `qr-flow.spec.ts` | Deep link entry |
| Venue | `vendor-portal.spec.ts` | Dashboard, stats |
| Venue | `order-status-update.spec.ts` | KDS workflow |
| Admin | `admin-portal.spec.ts` | Dashboard, stats |

---

## Gaps Fixed / Notes

- ✅ All required screens exist
- ✅ All async screens have loading states
- ✅ Empty states use shared `EmptyState` component
- ✅ Error states on auth screens (Login)
- ℹ️ Bell inbox is header component (not separate page)
- ℹ️ Pending claim redirects to Login after submission
