---
description: 
---

---
name: /flutter-e2e-device-qa-checklist
description: End-to-end real-device QA workflow for the Flutter customer app. Covers deep links, offline caching, menu performance, 4-tap ordering, external payment handoff, bell ring, and regression gates before release.
---

# /flutter-e2e-device-qa-checklist (Customer Flutter App)

## 0) Scope lock (non-negotiable)
This workflow produces:
- a device QA checklist
- pass/fail gates
- regression suite for every release

It must NOT:
- add new product features
- introduce login/signup
- add maps/location/payment APIs/delivery

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Flutter E2E device QA checklist"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Test matrix (must define)
Create `/docs/flutter_customer/qa/device_matrix.md`:

Minimum devices:
- Android low/mid (2GB–4GB RAM), Android 10–14
- Android mid/high, Android 12–15
- iPhone older (e.g., iPhone 11/12 class)
- iPhone newer (14/15 class)
- Optional: iPad (quick check)

Networks:
- WiFi good
- 4G/5G average
- poor network
- offline

---

## 3) QA checklist (must produce)
Create `/docs/flutter_customer/qa/e2e_checklist.md` with the following sections:

### 3.1 Install & launch
- install succeeds
- first launch shows Home (no signup)
- time-to-first-usable screen note
- no permission prompts (camera/location/contacts)

### 3.2 Navigation basics
- Home tab works
- Settings tab works
- back navigation behaves correctly
- app resumes from background without losing state (within reason)

### 3.3 Deep links
Test URLs:
- https://<domain>/
- https://<domain>/v/<valid-slug>
- https://<domain>/v/<invalid-slug>

Cases:
- app installed: opens app
- app not installed: opens web/PWA
- link opened from:
  - QR scanner
  - WhatsApp
  - Safari/Chrome

### 3.4 Venue discovery
- list loads
- pull-to-refresh works
- search works (if implemented)
- country behavior:
  - opening a RW venue sets RW
  - opening a MT venue sets MT

### 3.5 Menu performance
- menu loads fast
- category scroll works
- add item is one tap
- cart pill updates instantly
- scrolling remains smooth

### 3.6 4-tap order path (hard gate)
From menu:
1) Add item
2) Open cart
3) Checkout
4) Place order
Confirm:
- no extra required steps appear
- order created status “Received”

### 3.7 Payment handoff (external)
- RW venue:
  - MoMo USSD launches outside app
  - returning to app keeps order visible
- MT venue:
  - Revolut link opens outside app
  - returning to app keeps order visible
- Cash:
  - no external handoff

Confirm:
- app never claims payment confirmed
- venue manual confirmation assumption is clear (minimal text)

### 3.8 Bell ring
- bell screen opens
- table number required
- ring sends successfully
- success feedback shown

### 3.9 Offline behavior
- with cache:
  - Home shows cached venues
  - cached venue menu opens
- without cache:
  - app shows friendly offline state + retry
- ordering offline:
  - blocked with clear message; cart preserved

### 3.10 Error handling
Simulate:
- Supabase down
- timeouts
- partial failures (promos fail but venues load)

Verify:
- app does not crash
- user sees retry paths

### 3.11 Accessibility quick pass
- tap targets
- dynamic text size
- contrast on glass surfaces
- screen reader labels on primary buttons (basic)

---

## 4) Regression gates (release blockers)
Create `/docs/flutter_customer/qa/release_gates.md`:
Release must NOT proceed if:
- deep link fails on either platform
- 4-tap order path fails
- app prompts for forbidden permissions
- menu scrolling stutters severely on mid device
- crash rate spikes in staging
- payment handoff broken

---

## 5) Bug reporting template (must add)
Create `/docs/flutter_customer/qa/bug_template.md`:
- device + OS
- build flavor/version
- steps
- expected vs actual
- logs + screenshot
- deep link URL if relevant

---

## 6) Acceptance criteria (measurable)
- QA docs exist and cover all critical flows
- Release gates are explicit
- Checklists are runnable by a non-dev tester
- /scope-guard passes

---

## 7) Verification evidence
Provide:
- files created (paths)
- sample completed checklist snippet (1 device)
- /scope-guard pass/fail

---

## 8) Output format (mandatory)
At end, output:
- Files created/changed (paths)
- Device matrix summary
- Release gate summary
- /scope-guard pass/fail
