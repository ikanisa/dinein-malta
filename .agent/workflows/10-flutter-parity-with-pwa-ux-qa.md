---
description: 
---

---
name: /flutter-parity-with-pwa-ux-qa
description: Runs a strict parity audit between the Customer PWA and the Customer Flutter app: screens, navigation, tap-count budgets, component styling, copy, empty/loading/error states, and accessibility. Produces a QA matrix and fixes.
---

# /flutter-parity-with-pwa-ux-qa (Customer Flutter App)

## 0) Scope lock (non-negotiable)
This workflow creates:
- parity checklist and QA matrix
- visual + interaction comparisons
- tap-count audits for the core ordering flow
- fixes for drift (copy, spacing, widgets, states)

It must NOT:
- add new features or screens beyond what already exists
- add maps/location/payment APIs/scanner/delivery
- introduce login/signup
- change business rules (no payment verification)

Goal:
- Flutter and PWA must feel like the same product.

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Flutter vs PWA parity QA"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Parity matrix (must produce)
Create `/docs/flutter_customer/parity_matrix.md` with rows:

Columns:
- User journey
- Screen (PWA)
- Screen (Flutter)
- Components used
- Copy (exact)
- Tap count
- Loading state
- Empty state
- Error state
- Accessibility notes
- Pass/Fail
- Fix needed (Y/N)

Journeys to include (minimum):
1) First launch → Home shows venues
2) Home → open venue
3) Venue menu → add item
4) Cart → checkout
5) Checkout → place order (<= 4 taps from menu)
6) Payment handoff click (MoMo/Revolut)
7) Orders history view
8) Bell ring (table number)

---

## 3) Tap-count enforcement (hard gate)
Define in `/docs/flutter_customer/tap_budget.md`:
- Menu → Order placed must be ≤ 4 taps, defined as:
  1) Add item
  2) Open cart
  3) Checkout
  4) Place order

Any required additional tap is a FAIL.
Optional actions (details, pay now) do not count only if not required.

---

## 4) UI consistency rules
Create `/docs/flutter_customer/ui_consistency_rules.md`:
- token parity (colors/typography/radii)
- spacing parity (padding presets)
- widget parity (card/chip/button styles)
- motion parity (durations, curves)
- no new labels or marketing copy drift

---

## 5) State parity (often overlooked)
Ensure these states match between PWA and Flutter:
- skeleton loading layouts
- empty venue list
- empty menu category
- offline mode
- server error
- retry behaviors

Document and fix any mismatch.

---

## 6) Accessibility pass (baseline)
Minimum checks:
- tap targets
- text scaling (OS font size)
- contrast on glass surfaces
- screen reader labels for CTAs
- keyboard nav not required (mobile), but focus order should still be sane

---

## 7) QA execution plan (how to run it)
### 7.1 Visual comparisons
- capture screenshots of PWA and Flutter for each screen
- compare layout rhythm, spacing, and hierarchy

### 7.2 Interaction comparisons
- record tap flows
- validate there’s no extra friction in Flutter

### 7.3 Bug/fix cycle
- open issues for each FAIL
- fix in small PRs
- rerun matrix until PASS

---

## 8) Acceptance criteria (measurable)
- parity matrix exists and is fully filled
- core journeys match (visual + behavioral)
- ordering flow tap budget passes
- copy matches exactly (no accidental drift)
- loading/empty/error states match
- /scope-guard passes

---

## 9) Verification evidence
Provide:
- docs created (paths)
- completed matrix with PASS/FAIL
- before/after screenshots for fixes
- test runs (if applicable)
- /scope-guard pass/fail

---

## 10) Output format (mandatory)
At end, output:
- Files created/changed (paths)
- Parity summary (PASS rates)
- Top fixed drift items
- /scope-guard pass/fail
- Next workflow recommendation: /flutter-app-store-listing-copy
