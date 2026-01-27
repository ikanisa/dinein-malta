---
description: 
---

---
name: /flutter-customer-app-polish-microinteractions
description: Adds premium “native feel” polish to the Flutter customer app: haptics, micro-animations, skeleton tuning, tactile buttons, subtle transitions, and refined empty/error states—without adding new flows or screens.
---

# /flutter-customer-app-polish-microinteractions (Customer Flutter App)

## 0) Scope lock (non-negotiable)
This workflow improves:
- tactile feedback (haptics)
- micro-interactions (small animations)
- perceived performance (skeletons, transitions)
- consistency of empty/error messaging
- accessibility + reduced motion compliance

It must NOT:
- add new screens, journeys, or tabs
- add login/signup
- add maps/location/payment APIs/delivery
- introduce heavy animation frameworks

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Flutter polish + microinteractions"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Haptics (subtle and meaningful)
Use platform haptics:
- light impact on:
  - add-to-cart tap
  - primary CTA press (Place order)
  - bell ring success
- avoid haptics on every scroll or minor tap

Implement a wrapper:
- `core/utils/haptics.dart`
with functions:
- tap()
- success()
- warning()

Rules:
- respect reduced motion/feedback setting if you add it
- never vibrate aggressively

---

## 3) Micro-animations (tiny, premium)
Allowed animations:
- button press scale (0.98) + fade (120–160ms)
- cart pill “bump” on count change (small scale)
- list item add confirmation (brief highlight)
- page transitions: fade + slight slide

Forbidden:
- infinite loops
- large parallax
- animated blur

Ensure:
- `prefers-reduced-motion` equivalent in Flutter:
  - provide a global `reduceMotion` flag (wired from OS accessibility if possible)
  - disable non-essential animations when enabled

---

## 4) Skeletons (perceived speed)
Refine skeletons so they:
- match final layout dimensions
- avoid layout shift when data loads
- shimmer is optional; if used, keep it subtle and cheap

Apply to:
- Home venue list
- Venue menu list
- Orders list

---

## 5) Empty states (clean, helpful, minimal)
Implement consistent empty states:
- “No venues yet”
- “No menu items”
- “No orders yet”
- “Offline — showing saved results” (when cache exists)
- “No connection” (when required)

Rules:
- 1 line headline + 1 line hint max
- one CTA max (Retry / Back to Home)

No “AI” wording.

---

## 6) Error messaging (neutral, actionable)
Standardize error codes:
- TIMEOUT
- OFFLINE
- SERVER
- RATE_LIMITED
- INVALID_INPUT

Map each to:
- short user message
- action (retry, wait, edit input)

Implement:
- `core/utils/error_mapper.dart`

---

## 7) Visual polish checklist (tighten the vibe)
- consistent paddings (use spacing tokens only)
- consistent radii (cards, chips)
- glass overlay always behind text
- dividers and borders subtle
- icons minimal and consistent
- ensure bottom rail doesn’t cover content (safe-area)

---

## 8) Accessibility & ergonomics
- tap targets >= 44dp confirmed
- support larger text sizes (don’t break layouts)
- ensure contrast on glass surfaces
- semantics labels for:
  - Add button
  - Cart pill
  - Checkout
  - Place order
  - Ring bell

---

## 9) Testing & verification
Manual QA:
- add-to-cart feels responsive
- cart pill animation doesn’t stutter
- checkout button press feels tactile
- reduced motion disables non-essential animations
- skeleton → content transition has no layout jump

Automated:
- widget tests for empty states
- unit tests for error mapping

---

## 10) Acceptance criteria (measurable)
- haptics added only to key actions (not noisy)
- animations are subtle and respect reduced motion
- skeletons match final layout (no jank)
- empty/error states are consistent and minimal
- overall UI feels premium without more screens
- /scope-guard passes

---

## 11) Verification evidence
Provide:
- files changed (paths)
- short list of micro-interactions implemented
- screenshots/video notes (if possible)
- tests run (commands + results)
- /scope-guard pass/fail

---

## 12) Output format (mandatory)
At end, output:
- Files changed (paths)
- Polish items summary
- Accessibility notes
- /scope-guard pass/fail
- Next workflow recommendation: /flutter-customer-app-final-go-live-runbook
