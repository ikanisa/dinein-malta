---
description: 
---

---
name: /gesture-pack-safe
description: Adds a small, safe set of gesture interactions (swipe-to-dismiss sheets, swipe tabs, long-press quick actions) without breaking accessibility, without adding taps, and without creating accidental triggers. Applies across customer/venue/admin via packages/ui.
---

# /gesture-pack-safe (DineIn)

## 0) Scope (hard-locked)
This workflow adds gesture interactions ONLY as enhancements.
It must NOT:
- add new flows
- add maps/location
- add payment verification/APIs
- add scanner UI
- increase ordering beyond 4 taps

Rule:
- Every gesture must have a visible alternative (button) and must not be required.

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Gesture pack (safe)"
Output must include:
- Scope lock + exclusions
- Plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Gesture principles (to avoid accidental UX disasters)
- Gestures are optional shortcuts, never the only method.
- No gesture should trigger destructive actions without confirmation.
- Gestures must not break scroll.
- Respect accessibility:
  - keyboard alternatives
  - focus management
  - reduced motion preference
- On iOS Safari, be conservative (touch behavior quirks).

---

## 3) The only 4 gestures allowed (v1)
### 3.1 Swipe-to-dismiss bottom sheets
Applies to:
- item detail sheets
- claim review sheet
- order detail sheet

Rules:
- swipe down to dismiss
- scrim tap dismiss still works
- a close button exists
- focus returns to the triggering element

### 3.2 Swipe between tabs (horizontal)
Applies to:
- Venue orders queue tabs
- Admin claims filters (if tabs)
- Customer menu categories is NOT a tab swipe (keep categories as chips)

Rules:
- swipe left/right changes tab
- must not interfere with vertical scroll:
  - only activate if gesture starts near tab area or if horizontal intent is clear

### 3.3 Long-press quick actions (non-destructive)
Applies to:
- Venue order cards: quick open detail sheet
- Customer menu item card: quick add/remove (optional)
- Admin claim card: open review sheet

Rules:
- Must show a small context menu / action sheet
- No destructive action directly; destructive stays behind confirm

### 3.4 Pull-to-refresh (where lists exist)
Applies to:
- Home venue list
- Venue orders queue
- Bell inbox
- Admin claims list

Rules:
- optional if platform supports it
- always also provide a refresh icon/button in header for accessibility

---

## 4) Implementation approach (minimal dependencies)
Preferred:
- Use lightweight pointer/touch handling within packages/ui.
Avoid:
- big gesture libraries unless already in stack

Must respect:
- `prefers-reduced-motion`
- passive listeners where appropriate

---

## 5) Components to update in packages/ui
Create or enhance:

- `Sheet`:
  - swipe-to-dismiss support
  - close button always present
  - focus trap + return focus

- `Tabs`:
  - optional swipe navigation
  - keyboard navigation left/right
  - ARIA roles

- `ContextMenuSheet`:
  - long-press opens a small action sheet
  - also openable via “...” button

- `PullToRefresh` (optional wrapper):
  - standard hook: onRefresh()

---

## 6) Safety rails (must implement)
### 6.1 Destructive action confirmation
- Any “Cancel order”, “Disable venue”, “Reject claim”:
  - must require explicit tap on confirm button
  - gestures cannot trigger them directly

### 6.2 Gesture thresholds
- Set sensible thresholds to avoid misfires:
  - long-press: ~350–450ms
  - swipe dismiss: require a minimum delta + velocity
  - horizontal tab swipe: require horizontal dominance

### 6.3 Discoverability
- Add subtle hints once (optional):
  - small “Swipe down to close” hint on sheets (only first time, then never)
  - not a tutorial screen

---

## 7) Proof screens (must demonstrate)
Apply gestures to:
- Venue orders queue: swipe tabs + long-press order card -> action sheet
- Admin claims list: long-press claim card -> review sheet
- Any bottom sheet: swipe down dismiss

Do NOT add gestures to checkout or “Place order” paths.

---

## 8) Implementation sequence (in order)
1) Add gesture utilities (pointer handlers) in packages/ui
2) Update Sheet to support swipe dismiss + accessibility behavior
3) Update Tabs to support swipe navigation safely
4) Add ContextMenuSheet for long-press actions + “...” alternative
5) Add PullToRefresh wrapper where useful
6) Wire proof screens
7) Add reduced-motion safeguards
8) Add tests:
   - unit tests for threshold logic (where possible)
   - E2E: ensure swipe dismiss closes sheet (optional)
9) Run /scope-guard

---

## 9) Acceptance criteria (measurable)
- All gestures are optional shortcuts (buttons exist)
- No destructive actions triggered by gesture alone
- Reduced motion is respected
- Gestures do not break vertical scrolling
- Checkout flow unaffected and still ≤ 4 taps
- Proof screens show gestures working

---

## 10) Verification evidence
Provide:
- Demo steps (routes + what gestures to try)
- Screenshots/gifs (optional)
- Tests run (commands + results)
- Notes on iOS Safari behavior
- /scope-guard pass/fail

---

## 11) Output format (mandatory)
At end, output:
- Files changed (paths)
- Gestures implemented (list)
- Screens updated as proof
- Demo steps
- Tests run
- /scope-guard pass/fail
