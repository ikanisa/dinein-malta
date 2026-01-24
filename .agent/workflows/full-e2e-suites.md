---
description: 
---

---
name: /full-e2e-suites
description: Creates robust Playwright E2E test suites that continuously prove the 3 critical journeys: Customer order, Venue status update + bell, Admin claim approval. Includes stable selectors and deterministic test data.
---

# /full-e2e-suites (DineIn)

## 0) Scope (hard-locked)
This workflow creates E2E tests and supporting test utilities only.
It must NOT add product features.
It must enforce:
- no maps/location, no payment APIs/verification, no in-app scanner
- order statuses only: Placed/Received/Served/Cancelled
- customer nav exactly 2 tabs
- entry via /v/{venueSlug} goes directly to menu

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Full E2E suites"
Output must include:
- Scope lock + exclusions
- Plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Test strategy (principles)
### 2.1 Test only what must never break
Focus on:
A) Customer: deep link -> menu -> add -> cart -> checkout -> place order -> status
B) Venue: login -> orders queue -> mark Received -> Served -> customer sees updated
C) Admin: login -> approve claim -> venue becomes editable by claimant

### 2.2 Determinism rules (no flaky tests)
- Tests must not rely on real network randomness.
- Use seeded test data or a deterministic setup step.
- Use stable selectors via data-testid (never rely on text that may change).

### 2.3 Environment separation
- Support: local + staging
- Avoid running destructive tests on production.

---

## 3) Required repo artifacts
Create:

1) /tests/e2e/README.md (how to run, local/staging)
2) /tests/e2e/playwright.config.ts
3) /tests/e2e/fixtures/
   - selectors.ts (centralized test IDs)
   - testData.ts (venue slugs, demo users, etc.)
4) /tests/e2e/utils/
   - auth.ts (login helpers)
   - supabase.ts (optional: setup/cleanup helpers)
   - wait.ts (network/locator helpers)
5) /tests/e2e/specs/
   - 01_customer_order.spec.ts
   - 02_venue_orders_and_bell.spec.ts
   - 03_admin_claim_approval.spec.ts
6) /docs/testing/e2e.md (short doc for team)

If the repo already has tests, extend rather than duplicate.

---

## 4) Stable selectors contract (MUST implement in apps)
E2E requires adding data-testid attributes to key UI elements.

Create a single source of truth:
- packages/core/testids.ts (or tests/e2e/fixtures/selectors.ts)

Mandate these IDs (minimum):

### Customer
- venue-menu:page
- venue-menu:item-card:{itemId}
- venue-menu:add:{itemId}
- cart:pill
- cart:page
- cart:checkout
- checkout:page
- checkout:pay-method:cash
- checkout:pay-method:momo
- checkout:pay-method:revolut
- checkout:place-order
- order-status:page
- order-status:status-pill
- nav:home
- nav:settings

### Venue
- venue-login:page
- venue-login:email
- venue-login:pin
- venue-login:submit
- venue-dashboard:page
- venue-orders:page
- venue-orders:order-card:{orderId}
- venue-order:mark-received
- venue-order:mark-served
- venue-bell:page
- venue-bell:call-card:{callId}
- venue-bell:ack:{callId}

### Admin
- admin-login:page
- admin-login:email
- admin-login:password
- admin-login:submit
- admin-claims:page
- admin-claims:claim-card:{claimId}
- admin-claim:approve
- admin-claim:reject
- admin-venues:page (optional)
- admin-logs:page (optional)

Rule:
- Any new critical UI must add test IDs at creation time.

---

## 5) Test data requirements (seeded)
E2E assumes seeded demo data exists in local/staging:
- RW venue slug: rw-demo-venue
- MT venue slug: mt-demo-venue
- Demo venue owner user (venue portal):
  - email: owner_demo@dinein.test
  - pin: 1234
- Demo admin:
  - email: admin_demo@dinein.test
  - password: change_me_in_staging
- A pending claim:
  - claimant email: claimant_demo@dinein.test
  - pin: 1234
  - claim for a specific unowned venue slug: rw-unowned-venue

If seed names differ, centralize them in fixtures/testData.ts.

---

## 6) Required E2E specs (must implement)

### 6.1 Spec 01 — Customer order happy path
Steps:
1) Go to /v/{rw-demo-venue}
2) Assert menu page visible (venue-menu:page)
3) Add first item (venue-menu:add:{itemId})
4) Open cart via cart pill
5) Checkout
6) Choose pay method:
   - for RW: momo or cash (do not verify payment)
7) Place order
8) Assert redirected to order status page and status = Placed

Assertions:
- No scanner UI present
- No permission prompts triggered
- Tap budget preserved (best effort: ensure no unexpected steps)

### 6.2 Spec 02 — Venue updates order + bell
Steps:
1) Venue login
2) Open orders queue
3) Open latest Placed order
4) Mark Received
5) Mark Served
6) Separately, trigger a bell call:
   - create bell call either via UI in customer app (preferred)
   - or insert via setup helper (fallback)
7) Verify bell inbox shows the call, acknowledge it

Assertions:
- Only allowed statuses exist
- Owner-only access works (non-owner blocked) [optional negative test]

### 6.3 Spec 03 — Admin approves claim
Steps:
1) Admin login
2) Open claims list
3) Open a Pending claim
4) Approve claim
5) Verify claim status updated (Approved)
6) Verify venue owner assigned
7) Verify claimant can now access venue dashboard (optional cross-app step)

Assertions:
- Cannot approve if venue already has owner (optional negative test)
- Audit event written (if logs exist; optional)

---

## 7) Setup / teardown (choose one approach)
### Option A (preferred): Seed-only + non-destructive tests
- Use fixed demo dataset that resets periodically
- Tests only append new orders/bell calls, acceptable in staging

### Option B: Programmatic setup/cleanup (advanced)
- Use Supabase service role key in CI only
- Before each test:
  - create test venue/menu/order/bell
- After each:
  - cleanup test rows

If using Option B, NEVER expose service key to browser context.

---

## 8) CI integration (must add)
Add CI job:
- installs deps
- builds apps (or runs against deployed staging)
- runs Playwright with retries limited (avoid hiding flakiness)

Artifacts:
- trace on failure
- screenshots on failure
- html report

---

## 9) Acceptance criteria
- Running `pnpm e2e` (or equivalent) executes all 3 specs
- Specs pass on local with seeded data
- Specs pass on staging with configured base URLs
- Failures produce useful artifacts (trace/screenshot)
- Test IDs exist and are consistent across apps

---

## 10) Verification evidence
Provide:
- commands run
- sample report output
- list of selectors added (paths)
- screenshot/trace artifact locations

---

## 11) Output format (mandatory)
At end, output:
- Files created/changed (paths)
- How to run locally
- How to run on staging
- CI job summary
- Known gaps and next steps
- /scope-guard pass/fail (should pass; no features added)
