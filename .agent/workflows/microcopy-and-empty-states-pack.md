---
description: 
---

---
name: /microcopy-and-empty-states-pack
description: Standardizes microcopy and empty/loading/error states across all screens so the app feels finished and premium. Keeps copy ultra-minimal, action-driven, and consistent across customer/venue/admin.
---

# /microcopy-and-empty-states-pack (DineIn)

## 0) Scope (hard-locked)
This workflow improves:
- empty states
- loading states (skeletons)
- error states (retry patterns)
- microcopy consistency (labels, helper text)

It must NOT:
- add features
- add onboarding flows
- add images/photos
- change navigation structure

Must preserve:
- ordering ≤ 4 taps
- 2-tab customer nav
- no maps/location/payment APIs/scanner/delivery

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Microcopy + empty/loading/error pack"
Output must include:
- Scope lock + exclusions
- Plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Global microcopy rules (strict)
Create `packages/core/copy/` with:

### 2.1 Approved voice
- short, calm, helpful
- no exclamation marks by default
- no blame language

### 2.2 One action per state
- Empty state: 1 sentence + 1 CTA
- Error state: 1 sentence + Retry CTA (+ optional secondary “Back”)

### 2.3 Do not imply payment verification
Payment copy must say:
- “Payment happens in the other app.”
- “Show confirmation to staff.”

---

## 3) Shared state components (packages/ui)
Create reusable components:

- `EmptyState`
  - title (short)
  - body (optional)
  - primaryAction (button)
  - icon (simple, optional)

- `ErrorState`
  - message
  - retryAction
  - secondaryAction (optional)

- `SkeletonBlock` / `SkeletonList`
  - standardized shapes for menus, lists, cards

Rules:
- Use these components everywhere; do not hand-roll per screen.

---

## 4) State patterns per screen category
### 4.1 Lists (venues, orders, claims, bell calls)
Loading:
- skeleton list rows

Empty:
- “Nothing here yet.”
- CTA: “Refresh” or “Browse venues”

Error:
- “Couldn’t load. Check connection.”
- CTA: “Retry”

### 4.2 Detail screens (venue menu, order detail)
Loading:
- header skeleton + item list skeleton

Empty:
- venue has no menu:
  - “Menu not available yet.”
  - CTA: “Back”

Error:
- “Couldn’t load menu.”
- CTA: “Retry”

### 4.3 Forms (login, edit venue, claim)
Loading:
- disable submit + show inline spinner

Empty not applicable.

Error:
- short inline message near submit
- toast optional

---

## 5) Screen-by-screen microcopy pack (minimum keys)
Create a key registry file:
- `packages/core/copy/keys.ts`

Populate keys for:
Customer:
- Home empty, Home error
- Menu empty/error
- Cart empty
- Checkout guidance + payment handoff
- Order history empty
- Favorites empty
- A2HS messaging

Venue:
- Login helper
- Claim pending helper
- Orders empty
- Bell empty
- Menu upload statuses:
  - Pending/Running/NeedsReview/Failed/Published
- Publish confirmation text

Admin:
- Claims empty
- Claims approve/reject confirmation
- Logs empty/error

Keep keys minimal; reuse across screens.

---

## 6) Confirmation patterns (destructive actions)
Standardize:
- Cancel order
- Reject claim
- Disable venue/user
Use a single `ConfirmDialog` with:
- title
- body (1 sentence)
- confirm label
- cancel label

---

## 7) Implementation sequence (in order)
1) Add shared EmptyState/ErrorState/Skeleton components
2) Add copy key registry + default EN strings
3) Sweep customer screens first:
   - /v/{slug}, cart, checkout, order status, Home, Settings lists
4) Sweep venue screens:
   - login, dashboard lists, orders, bell, menu upload/review
5) Sweep admin screens:
   - claims, venues, logs
6) Ensure toasts use consistent phrases
7) Run a “blank-screen hunt” (no page should be empty white)
8) Run Lighthouse (a11y + perf) quick check
9) Run /scope-guard

---

## 8) Acceptance criteria (measurable)
- Every screen has explicit loading/empty/error UI
- No “raw” error dumps or blank screens
- Copy is consistent and minimal
- Payment copy never implies verification
- Destructive actions always require confirmation
- Ordering tap budget remains ≤ 4

---

## 9) Verification evidence
Provide:
- checklist of screens updated
- screenshots of:
  - empty Home
  - menu error state
  - cart empty
  - venue orders empty
  - admin claims empty
  - menu upload failed state
- tests run (if any)
- /scope-guard pass/fail

---

## 10) Output format (mandatory)
At end, output:
- Files created/changed (paths)
- Copy keys summary
- Screens updated summary
- Demo steps
- Tests run
- /scope-guard pass/fail
