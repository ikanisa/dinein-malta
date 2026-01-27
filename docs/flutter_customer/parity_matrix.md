# Flutter vs PWA Parity Matrix

**Status**: 🟢 = Parity Achieved | 🟡 = Minor Drift | 🔴 = Major Divergence

| Journey | Screen | Components | Copy | Tap Count | States | A11y | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Discovery** | Home | `VenueList`, `VenueCard` | Match | 1 (to Menu) | 🟢 | 🟢 | 🟢 | Skeleton loading animation matches PWA shimmy. |
| **Menu** | Venue Menu | `MenuHeader`, `CategoryTabs`, `MenuItemTile` | Match | N/A | 🟢 | 🟢 | 🟢 | Sticky headers implemented. |
| **Cart** | Cart Sheet | `FloatingCartPill`, `CartList` | Match | 2 (Add -> Open) | 🟢 | 🟢 | 🟢 | Bump animation on pill matches PWA. |
| **Checkout** | Checkout | `PaymentSelector`, `OrderSummary` | Match | 1 (to Place) | 🟢 | 🟢 | 🟢 | Form input styles match design tokens. |
| **Engagement** | Bell | `BellButton`, `NotificationToast` | Match | 1 | 🟢 | 🟢 | 🟢 | Haptics added (Upgrade over PWA). |
| **History** | Orders | `OrderList`, `StatusBadge` | Match | 2 (Home -> History) | 🟢 | 🟢 | 🟢 | Date formatting consistent. |

## Drift Report

### Resolved
*   [x] **Colors**: Flutter Primary Brand color aligned with PWA token `#000000`.
*   [x] **Spacing**: `VenueCard` padding adjusted to 16px to match web.
*   [x] **Typography**: Font weights for Headers aligned (Bold vs ExtraBold).

### Known Differences (Accepted)
*   **Navigation**: Flutter uses Native Page Transitions (Slide/Cupertino), PWA uses simple fade/instant. **Verdict**: Keep Native.
*   **Haptics**: Flutter has haptics, PWA does not (mostly). **Verdict**: Upgrade accepted.
