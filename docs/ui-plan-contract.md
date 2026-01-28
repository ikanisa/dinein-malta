# UIPlan Contract v1

The UIPlan Contract defines a deterministic UI schema that Moltbot (UI Orchestrator) outputs and both Flutter and PWA clients render. The model never controls UI directly—it only emits a plan.

---

## Schema Reference

**Version**: `ui_plan.v1`  
**JSON Schema**: [`packages/core/src/schemas/ui-plan.schema.json`](file:///Users/jeanbosco/workspace/dinein/packages/core/src/schemas/ui-plan.schema.json)

### Top-Level Structure

```json
{
  "version": "ui_plan.v1",
  "planId": "plan_abc123",
  "generatedAt": "2026-01-28T10:00:00Z",
  "tenant": { "tenantId": "dinein", "venueId": "venue_123" },
  "session": { "sessionKey": "sess_...", "actor": {...} },
  "screen": { "name": "home", "title": "Welcome", "layout": "scroll" },
  "sections": [...],
  "actions": { "byId": {...} },
  "cache": { "ttlSeconds": 300 }
}
```

---

## Screen Names

| Name | Description |
|------|-------------|
| `home` | Main discovery screen with venues + offers |
| `search` | Search results |
| `venue` | Single venue overview |
| `menu` | Menu categories + items |
| `item` | Single item detail |
| `checkout` | Cart + order confirmation |
| `orders` | Order history |
| `chat_waiter` | Conversational waiter |
| `profile` | Guest settings |

---

## Section Types

| Type | Items | Description |
|------|-------|-------------|
| `hero` | 1 | Full-width banner/greeting |
| `chips` | N | Horizontal chip filters |
| `carousel` | N | Horizontal scrolling cards |
| `grid` | N | 2-column grid |
| `list` | N | Vertical list |
| `banner` | 1 | Promo banner |
| `metrics` | N | Key-value pairs (totals, stats) |
| `divider` | 0 | Visual separator |
| `cta` | 1 | Primary call-to-action button |

---

## Action Intents

| Intent | Required Params | Optional Params | State-Changing |
|--------|-----------------|-----------------|----------------|
| `openHome` | — | referrer | ❌ |
| `openSearch` | — | query, filters | ❌ |
| `openVenue` | venueId | referrer | ❌ |
| `openMenu` | venueId | categoryId | ❌ |
| `openItem` | itemId | venueId | ❌ |
| `applyFilter` | filters | scope | ❌ |
| `clearFilters` | — | scope | ❌ |
| `startVisit` | venueId | tableId, partySize | ✅ |
| `addToCart` | visitId, itemId, qty | addons, notes | ✅ |
| `updateCartItem` | visitId, lineId, patch | — | ✅ |
| `removeFromCart` | visitId, lineId | — | ✅ |
| `openCheckout` | visitId | — | ❌ |
| `confirmOrder` | visitId | paymentMethod, tip | ✅ |
| `openChatWaiter` | visitId | — | ❌ |
| `sendWaiterMessage` | visitId, message | attachments | ✅ |
| `callStaff` | visitId, reason | priority | ✅ |
| `requestBill` | visitId | — | ✅ |
| `openOrders` | — | venueId | ❌ |
| `trackOrder` | orderId | — | ❌ |
| `openExternalUrl` | url | label | ❌ |

---

## Rendering Rules

1. Clients must NOT execute arbitrary navigation—only handle known intents
2. If `actionRef` is missing/invalid → render item as non-clickable
3. If `media.imageUrl` is missing → show placeholder icon
4. If sections array is empty → show fallback "No results" section (client-side)
5. Max 50 sections, max 100 items/section; extras truncated by server
6. All text lengths enforced; client truncates with ellipsis

---

## Safety Validation (Server-Side)

The server validates every UIPlan before returning to clients:

| Check | Rule |
|-------|------|
| Schema | Must match JSON Schema |
| ID References | All IDs must exist in tool outputs (no invented IDs) |
| Intent Params | All required params present; unknown params rejected |
| External URLs | Must match domain allowlist |
| PII | No emails/phone numbers unless policy-allowed |
| Tenant Match | `tenantId`/`sessionKey` must match request envelope |
| Confirmation | State-changing actions should have `requiresConfirmation=true` |

---

## Domain Allowlist (openExternalUrl)

```
*.mtn.co.rw          # MoMo Rwanda
momo.mtn.rw
revolut.me           # Revolut Malta
pay.revolut.com
instagram.com
www.instagram.com
facebook.com
www.facebook.com
google.com/maps
maps.google.com
```

---

## Examples

See [`docs/examples/ui-plans/`](file:///Users/jeanbosco/workspace/dinein/docs/examples/ui-plans/) for full JSON examples:

- `home.json` — Home screen with venues + offers
- `venue.json` — Venue overview
- `menu.json` — Menu with categories + items
- `checkout.json` — Cart + confirmation
- `chat_waiter.json` — Conversational waiter

---

## TypeScript Types

Import from `@dinein/core`:

```typescript
import {
  UIPlan,
  UIPlanSection,
  SectionItem,
  ActionIntent,
  validateIntentParams,
  isStateChangingIntent,
} from '@dinein/core';
```

---

## Versioning

- Clients must ignore unknown fields (forward compatibility)
- Server may add fields but must not break required fields
- Version bumps only for breaking changes
