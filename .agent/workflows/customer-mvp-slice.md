---
description: 
---

---
name: /customer-mvp-slice
description: Builds the complete customer MVP slice end-to-end: deep link -> menu -> cart -> checkout -> place order -> status/history. Enforces dine-in constraints and 4-tap ordering.
---

# /customer-mvp-slice

## 0) Scope (hard-locked)
This workflow builds ONLY the customer MVP. It MUST NOT introduce:
- delivery, maps, geolocation, payment APIs/verification, in-app QR scanning, or extra statuses.

Order statuses allowed:
- Placed, Received, Served, Cancelled

Entry rules:
- QR scan happens outside app (phone camera) -> opens /v/{venueSlug}
- /v/{venueSlug} must land directly on the Venue Menu screen

Bottom nav:
- EXACTLY two tabs: Home + Settings

---

## 1) Preconditions (before coding)
- Confirm monorepo apps exist:
  - apps/customer
- Confirm packages exist:
  - packages/ui, packages/core, packages/db
- Confirm Supabase project exists (local or remote) OR use mocked data temporarily
- Confirm canonical deep link format:
  - /v/{venueSlug}
  - optional ?t=12

If any of these are missing, create the smallest scaffolding needed and stop for review.

---

## 2) Kickoff (mandatory)
Run: /kickoff with the scope: "Customer MVP slice"

Output must include:
- Scope lock + exclusions
- Plan + tasks + acceptance criteria + verification plan
Stop at the execution gate unless XS.

---

## 3) /ui-spec (mandatory)
Run: /ui-spec for customer MVP. Must include these screens:

A) Deep link Venue Menu (default entry)
- Route: /v/{venueSlug}
- Sticky cart pill
- Category chips (scroll)
- Item cards with inline Add / +/- stepper
- Bottom sheet item details (only if options/notes are needed)
- Loading/empty/error states

B) Cart
- Route: /cart (or /v/{slug}/cart)
- Edit quantities, notes
- Subtotal summary
- Primary CTA: Checkout
- Loading/empty/error states

C) Checkout
- Route: /checkout
- Pay method options:
  - Cash (always)
  - MoMo USSD (only if venue.country=RW)
  - Revolut Link (only if venue.country=MT)
- Place Order CTA

D) Payment handoff screen (instruction-only)
- Route: /pay
- Button: "Open MoMo" (launch USSD) OR "Open Revolut"
- Copy: "After paying, show confirmation to staff."
- No verification logic

E) Order status
- Route: /orders/{id}
- Timeline widget: Placed -> Received -> Served or Cancelled

F) Home (discovery)
- Route: /home (or /)
- List venues filtered by activeCountry (derived)
- Search + promos (optional but minimal)
- No location usage

G) Settings
- Route: /settings
- Optional profile fields: displayName, whatsapp
- Order history list
- Favorites list (venues/items)
- "Invite friends" share link (app root)
- "Add venue" CTA (links to venue claim flow later)
- "Add to Home Screen" entry (manual)

Install prompt:
- Must not show on first paint. Trigger only after engagement (see rules).

---

## 4) Data model (minimum viable)
Implement or stub these entities:

- Venue: { id, slug, name, country (RW|MT), momoCode?, revolutLink?, ... }
- MenuCategory: { id, venueId, name, sort }
- MenuItem: { id, categoryId, name, description?, price, currency, available }
- Order: { id, venueId, userId?, tableNo?, status, payMethod, total, createdAt }
- OrderItem: { orderId, itemId, qty, priceSnapshot, notes? }

If backend is not ready:
- Provide a mock adapter in packages/db that can be swapped to Supabase later WITHOUT rewriting UI logic.

---

## 5) Core state (customer)
Implement in a predictable way:

- activeCountry:
  - derived from venue on /v/{slug}
  - cached locally (localStorage) for Home filtering
- cart state:
  - in client state store
  - keyed by venueId (prevent mixing items across venues)
- tableNo (optional):
  - read from query param ?t=
  - allow user to edit/add on checkout (optional)

Rules:
- Do not require login to order.
- Profile fields are optional; store only if provided.

---

## 6) Tap budget enforcement (must pass)
From Venue Menu screen:
1) Tap Add (inline)
2) Tap Cart pill
3) Tap Checkout
4) Tap Place Order

If any extra steps are added, STOP and redesign.

---

## 7) Add-to-Home-Screen prompt (A2HS)
Implement install nudges:

- Show A2HS prompt only if:
  - not installed AND
  - user placed an order OR added 2+ items OR spent ~45 seconds browsing
- Never show on initial load.
- If user dismisses, respect dismissal (cooldown, e.g., 7 days).

Provide Settings -> "Add to Home Screen" as manual fallback.

---

## 8) Implementation sequence (vertical slice)
Implement in this exact order:

1) Deep link route /v/{slug} -> loads venue -> sets activeCountry -> renders menu UI
2) Cart pill + cart store + quantity stepper
3) Cart page
4) Checkout page + pay method gating by venue.country
5) Place order (creates Order + OrderItems)
6) Order status page
7) Settings: order history + optional profile fields
8) Home: discovery list filtered by activeCountry
9) A2HS prompt logic
10) Polish states + skeletons + error handling

After each step, provide a browser demo path and verify.

---

## 9) Verification (required evidence)
### Manual checks (must list results)
- Opening /v/{slug} lands on menu, no scanning UI exists
- activeCountry updates based on venue country
- Home shows venues filtered by activeCountry
- Checkout shows correct pay options based on country
- Place order creates an order with status=Placed
- Status updates display correctly
- No permission prompts appear (no camera, no location)
- Tap budget preserved

### Automated tests (minimum)
- Unit: cart math (subtotal, qty changes)
- Integration: order creation payload builder
- E2E happy path:
  - /v/{slug} -> add item -> cart -> checkout -> place order -> status visible

Evidence to produce:
- commands run
- test output
- 2–4 screenshots showing: menu entry, cart pill, checkout pay options, order status

---

## 10) Output format (mandatory)
At end, output:
- Files changed (paths)
- Demo steps (exact routes to open)
- Tests run (commands + result)
- Known gaps + next slice recommendation
- Run /scope-guard and report pass/fail
