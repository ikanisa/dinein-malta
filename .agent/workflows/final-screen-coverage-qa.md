---
description: 
---

---
name: /final-screen-coverage-qa
description: Ensures every required screen exists (customer/venue/admin), is clickable, has loading/empty/error states, and supports complete user journeys. Produces a coverage matrix + QA checklist + fixes gaps.
---

# /final-screen-coverage-qa (DineIn)

## 0) Scope (hard-locked)
This workflow is QA + gap-filling only:
- verify all required screens exist
- verify navigation works
- verify all screens have states
- verify journeys are complete and ≤ tap budgets

Must NOT add:
- maps/location
- payment verification/APIs
- in-app QR scanning
- delivery features

Must preserve:
- customer 2-tab nav
- /v/{slug} deep link entry to menu
- ordering ≤ 4 taps
- statuses only: Placed/Received/Served/Cancelled

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Final screen coverage QA"
Output must include:
- Scope lock + exclusions
- Plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Coverage Matrix (must generate)
Create `/docs/screen-coverage-matrix.md` with a table:

Columns:
- App (customer|venue|admin)
- Screen name
- Route
- Exists (Y/N)
- Clickable nav path exists (Y/N)
- States present (loading/empty/error) (Y/N)
- Mobile layout verified (Y/N)
- Test coverage (none/unit/e2e)
- Notes/Gaps

Minimum required screens:

### Customer
- Venue Menu (/v/{slug})
- Cart
- Checkout
- Payment handoff (instruction-only)
- Order status
- Home (discovery)
- Settings (profile optional, history, favorites, invite, add venue CTA, A2HS)
- Offline fallback page (from PWA slice)

### Venue
- Login
- Claim (search + submit)
- Pending claim screen
- Dashboard
- Edit venue profile
- Payment handles
- Share & QR generator
- Menu manager
- Menu upload + OCR staging review
- Orders queue + order detail
- Bell inbox

### Admin
- Login
- Dashboard
- Claims list + detail
- Approve/Reject claim
- Venues list + detail
- Owner reassign tool
- Menus audit (optional but recommended)
- Users list (minimal)
- Logs

---

## 3) Clickability audit (no dead ends)
For each screen, define at least one clickable path:
- from nav
- or from a CTA/button
- or from a deep link

Rules:
- Customer must be usable without auth.
- Venue/Admin must clearly gate with login.

---

## 4) State coverage audit (no blank screens)
Every screen must have:
- Loading state (skeleton preferred)
- Empty state (1 line + 1 action)
- Error state (short + retry)
- Success state

If missing, add using shared UI templates/widgets.

---

## 5) Journey QA (must pass)
### 5.1 Customer journey
- Open /v/{slug}
- Add item → cart → checkout → place order (≤4 taps)
- View order status
- Navigate to Home and back
- View order history in Settings
- A2HS prompt behavior verified (not on first paint)

### 5.2 Venue journey
- Claim venue (if unowned) -> pending
- Admin approves -> owner can login
- Owner edits venue details
- Owner generates venue QR + table QR
- Owner reviews OCR staging and publishes menu
- Owner processes an order (Received -> Served)
- Owner handles bell calls

### 5.3 Admin journey
- Admin logs in
- Reviews claims
- Approves claim and assigns ownership
- Views audit logs

---

## 6) QA tooling (minimum)
- Add a simple internal QA route list page (dev-only) per app:
  - /__qa/routes
  - lists all routes and lets you open them quickly
- Ensure it is disabled in production builds.

Optional:
- Playwright smoke suite that visits each route.

---

## 7) Fix strategy (smallest changes first)
When gaps are found:
1) Add missing screen scaffold using /screen-factory prompt
2) Add nav/CTA to reach it
3) Add states
4) Add basic tests/hooks
5) Re-run coverage matrix and mark fixed

Do not do sweeping refactors during QA unless necessary.

---

## 8) Acceptance criteria (measurable)
- Coverage matrix shows 100% of required screens exist
- Every required screen is reachable via a clickable path
- Every required screen has loading/empty/error states
- All 3 journeys pass on mobile viewport
- Customer ordering tap budget ≤ 4 remains true
- No banned features are introduced

---

## 9) Verification evidence
Provide:
- Updated coverage matrix
- Screenshots (at least):
  - customer venue menu + checkout
  - venue share/QR screen
  - admin claims approval screen
- Results of smoke tests (manual or Playwright)
- List of gaps found and fixes applied

---

## 10) Output format (mandatory)
At end, output:
- Coverage matrix path + summary (% complete)
- Gaps found + fixes
- Demo steps (exact routes)
- Tests run (commands + results)
- /scope-guard pass/fail
