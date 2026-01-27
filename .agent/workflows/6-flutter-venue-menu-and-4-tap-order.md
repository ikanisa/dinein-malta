---
description: 
---

---
name: /flutter-venue-menu-and-4-tap-order
description: Implements the Venue Menu + Cart + Checkout flow in Flutter with a strict 4-tap ordering target. Includes payment handoff (MoMo USSD / Revolut link / Cash), order creation (no payment verification), order status, and the table bell ring feature.
---

# /flutter-venue-menu-and-4-tap-order (Customer Flutter App)

## 0) Scope lock (non-negotiable)
This workflow builds:
- Venue Menu screen (text-first)
- Cart + Checkout screens
- External payment handoff:
  - Rwanda: MoMo USSD launch (no API)
  - Malta: Revolut deep link launch (no API)
  - Cash option
- Order creation + order status display
- Bell ring feature (table number)

It must NOT:
- add login/signup
- add payment verification or payment APIs
- add delivery concepts
- add maps/location
- add in-app QR scan UI

Status model:
- received, served, cancelled (and optional: pending)
No “ready for delivery”.

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Flutter Venue Menu + 4-tap order"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Screen map (must implement)
### 2.1 Venue Menu (primary)
- VenueMenuScreen:
  - Venue header (name, specialties chips)
  - Category tabs (scrollable)
  - Menu items list (name, price, tags chips)
  - “Add” action per item (single tap)
  - Floating Cart Pill (shows item count + total)
  - Bell icon (tap -> Bell screen)

No images required.

### 2.2 Cart (secondary)
- CartScreen:
  - line items with QuantityStepper
  - subtotal (simple)
  - “Checkout” button

### 2.3 Checkout (payment handoff + place order)
- CheckoutScreen:
  - Payment method selector:
    - Cash
    - MoMo (if venue.country == RW and venue has momo_code)
    - Revolut (if venue.country == MT and venue has revolut_link)
  - Optional: Table number field (if you require)
  - Primary CTA: “Place order”
  - Secondary: “Pay now” (only for MoMo/Revolut, launches external app/USSD)

Design rule:
- Keep this screen minimal; no long instructions.

### 2.4 Order confirmation
- OrderPlacedScreen:
  - status chip “Received”
  - summary
  - “Back to menu” / “View orders”
  - Do not claim payment confirmed

### 2.5 Orders list (light)
- OrdersScreen (from Settings -> Order history):
  - list local orders
  - show latest status if available

### 2.6 Bell ring
- BellScreen:
  - input: table number
  - CTA: “Ring”
  - sends bell request to venue via backend (no chat)

---

## 3) The 4-tap ordering target (define precisely)
From VenueMenuScreen:
1) Tap “Add” on an item (cart pill appears/updates)
2) Tap Cart Pill
3) Tap “Checkout”
4) Tap “Place order”

This is the baseline path.
Payment handoff (MoMo/Revolut) is optional and occurs outside the app.
Do not add mandatory steps that increase taps.

---

## 4) Menu interaction rules
- Quick add button on each item
- Long press or “details” sheet optional but must not be required
- Category tabs jump scroll (fast)
- Keep item tiles compact but readable

---

## 5) Payment handoff implementation (no verification)
### 5.1 Rwanda (MoMo USSD)
- Venue provides momo_code (e.g., merchant code)
- App composes a USSD string based on known pattern you use
- Launch USSD via platform intent (outside app)
- Return to app and allow user to place order OR place order first then pay (choose ONE)

Choose one ordering:
A) Place order first, then “Pay now” (recommended; avoids losing order if user exits)
B) Pay now first, then place order (risk: no proof)

Default: A) Place order first.

Important:
- show neutral copy: “Payment is completed in your mobile money app. Venue confirms manually.”

### 5.2 Malta (Revolut)
- Venue provides revolut_link
- Launch link externally via url_launcher
- Same rule: do not verify payment

### 5.3 Cash
- No handoff

---

## 6) Order creation contract
Use order_repository.createOrder via Edge Function:
Payload includes:
- session_id
- venue_id
- items [{item_id, qty, price_snapshot?}]
- payment_method: cash|momo_ussd|revolut_link
- table_number (optional)
- note (optional, but avoid free text if you want strict)

Server returns:
- order_id
- status = received
- created_at

Store locally:
- order_id
- venue_name
- total
- payment_method
- created_at
- last_known_status

---

## 7) Status refresh strategy (no auth)
Without customer auth, keep it simple:
- Orders list reads local history
- For each order_id, app can refresh status via:
  - a safe read endpoint (Edge Function) requiring order_id + session_id
OR
  - public read policy if you are comfortable (less ideal)

Default:
- Edge Function `get_order_status` requiring (order_id, session_id)

Do not show push notifications in v1 unless already planned.

---

## 8) Bell ring contract
BellRepository calls Edge Function `ring_bell` with:
- session_id
- venue_id
- table_number (required)

Return:
- ok
- created_at
- optional request_id

UX:
- show quick success toast “Sent to venue”
- no confirmation beyond that

---

## 9) State management (keep stable)
Implement:
- cart state scoped per venue (cart clears when switching venue unless you allow multi-venue carts; default: single-venue cart)
- derived totals
- optimistic UI updates

Avoid:
- rebuilding entire menu list when cart changes (use selectors)

---

## 10) Offline behavior
- Menu should render from cache if offline
- Place order requires network; if offline:
  - show “No connection” and keep cart
- Bell requires network; if offline:
  - show “No connection”

---

## 11) Testing & verification
Unit tests:
- cart calculations
- 4-tap path invariants (ensure no extra required steps)
- payment method availability by country and venue fields

Widget tests:
- menu renders categories and items
- cart pill updates
- checkout shows correct payment methods

Manual QA:
- full flow: add -> cart -> checkout -> place order
- MoMo USSD launches (RW device/sim)
- Revolut link launches (MT test)
- bell ring sends and shows success
- order appears in history

---

## 12) Acceptance criteria (measurable)
- Venue menu is fast, text-first, and usable without images
- Default ordering path is <= 4 taps (defined above)
- External payment handoff works without in-app verification
- Orders are created and visible in history without login
- Status refresh works via safe endpoint
- Bell ring works
- /scope-guard passes

---

## 13) Verification evidence
Provide:
- files changed (paths)
- screenshots: menu, cart pill, checkout, order placed, bell screen
- sample Edge Function payloads (sanitized)
- tests run (commands + results)
- /scope-guard pass/fail

---

## 14) Output format (mandatory)
At end, output:
- Files changed (paths)
- Tap-count proof (step list)
- Payment handoff summary
- Next workflow recommendation: /flutter-offline-cache-and-performance
- /scope-guard pass/fail
