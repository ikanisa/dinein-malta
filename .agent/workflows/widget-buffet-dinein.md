---
description: 
---

---
name: /widget-buffet-dinein
description: Adds a curated set of dine-in widgets that make the PWAs feel native and premium without adding journeys, images, maps, payment APIs, or extra taps. Widgets are reusable and live in packages/ui.
---

# /widget-buffet-dinein (DineIn)

## 0) Scope (hard-locked)
This workflow adds UI widgets only (components + patterns).
It must NOT:
- add maps/geolocation
- add payment verification/APIs
- add in-app QR scanning
- add delivery concepts
- increase customer ordering beyond 4 taps

Rule:
- Widgets must be optional enhancements and must not block ordering.

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Dine-in widget buffet"
Output must include:
- Scope lock + exclusions
- Plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Widget selection rules (prevent clutter)
Every widget must:
- solve a real dine-in need
- be skippable
- fit on mobile
- have loading/empty/error states if data-backed
- use tokens + shared primitives only

If a widget adds a new journey step, it is rejected.

---

## 3) The 12 approved widgets (curated)
Implement these in `packages/ui/widgets/` and compose them into screens lightly.

### Customer widgets
1) **Sticky Cart Pill** (already core)
- count + subtotal + one tap open cart

2) **Table Number Sheet**
- small sheet to set/edit table number
- auto-suggest from query param ?t=
- appears only if table_no is missing at checkout (optional)

3) **Quick Add Bar (Category-aware)**
- mini row at bottom when user scrolls deep:
  - “Add another?” + last category chip + jump-to-top
- must not obscure cart pill

4) **Order Progress Timeline**
- status track with subtle animation

5) **Reorder Button**
- in order history: “Reorder” creates a cart from past items
- MUST not auto-place order; just fills cart

6) **Favorites Micro-toggle**
- heart toggle on venue card and on menu items (optional)
- tiny haptic feedback (best effort)

7) **Promo Ticker (Subtle)**
- a small rotating promo strip on Home and venue menu header
- no autoplay distraction; rotate slowly or manual swipe

8) **Install Hint Chip**
- small chip: “Add to Home Screen”
- appears only after engagement and respects cooldown

### Venue widgets
9) **Orders Queue Tabs + Count Badges**
- Placed/Received/Served/Cancelled with counts
- shows “New” badge for Placed

10) **Bell Alert Pulse**
- icon with pulse when new bell calls exist
- one-tap to bell inbox

11) **QR Action Dock**
- quick dock in Share screen:
  - Copy link
  - Download QR
  - Table QR generator
- no extra pages

### Admin widgets
12) **Claim Review Sheet**
- claim card opens bottom sheet with:
  - venue preview
  - claimant preview
  - Approve/Reject buttons
- keeps admin flows fast on mobile

---

## 4) Where widgets are allowed (placement rules)
### Customer
- Venue Menu: cart pill + promo ticker (tiny) + favorites toggle optional
- Cart: reorder is not here (keep cart clean)
- Checkout: table number sheet (only if needed)
- Settings: reorder list + favorites list + install hint

### Venue
- Dashboard: orders counts + bell pulse
- Orders: queue tabs + detail sheet
- Share: QR action dock

### Admin
- Claims: claim review sheet
- Dashboard: tiny counts

Rule:
- No widget overload on a single screen (max 2–3 visible at once).

---

## 5) Implementation sequence (in order)
1) Define widget folder structure in packages/ui
2) Implement base widgets (TableSheet, ReorderButton, FavoritesToggle)
3) Implement admin claim review sheet
4) Implement venue QR action dock and bell pulse
5) Wire widgets into 3 proof screens:
   - Customer venue menu
   - Venue orders queue
   - Admin claims list
6) Add minimal tests (unit for state + snapshot if desired)
7) Document in /docs/design/widgets.md
8) Run /scope-guard

---

## 6) Acceptance criteria (measurable)
- Widgets exist in packages/ui and are reusable
- Proof screens use widgets without clutter
- Customer ordering still ≤ 4 taps
- No images introduced
- No new banned integrations introduced
- All widgets have proper states and accessibility basics

---

## 7) Verification evidence
Provide:
- Files added/changed (paths)
- Screenshots:
  - venue menu with cart pill + (optional) promo ticker
  - checkout with table sheet
  - venue orders with tabs + bell pulse
  - admin claims with review sheet
- Tests run (commands + results)
- /scope-guard pass/fail

---

## 8) Output format (mandatory)
At end, output:
- Widget list implemented
- Files created/changed
- Screens updated as proof
- Demo steps
- Tests run
- /scope-guard pass/fail
