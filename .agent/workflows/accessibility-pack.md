---
description: 
---

---
name: /accessibility-pack
description: Makes the three PWAs genuinely accessible: keyboard navigation, focus management, ARIA semantics, contrast checks, reduced-motion support, and screen-reader-friendly components. Applies through packages/ui.
---

# /accessibility-pack (DineIn)

## 0) Scope (hard-locked)
This workflow improves accessibility only.
It must NOT add product features, flows, or integrations.
Must preserve:
- customer 2-tab nav
- /v/{slug} entry to menu
- ordering ≤ 4 taps
- no scanner UI, no maps/location, no payment APIs

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Accessibility pack"
Output must include:
- Scope lock + exclusions
- Plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Accessibility baseline (targets)
Aim for:
- Lighthouse Accessibility ≥ 90
- WCAG-ish basics (practical):
  - contrast
  - focus visible
  - keyboard usable
  - screen reader labels
  - reduced motion honored

---

## 3) Component-level requirements (packages/ui)
Audit and upgrade these components:

### 3.1 Navigation
- BottomNav:
  - proper landmarks
  - aria-current for active tab
  - keyboard nav (Tab + Enter/Space)

### 3.2 Buttons & inputs
- All buttons must have accessible names
- Inputs must have labels (visible or aria-label)
- PinInput:
  - label + instructions
  - proper inputmode and autocomplete hints
  - focus order predictable

### 3.3 Sheets / dialogs
- Sheet:
  - focus trap while open
  - Esc to close (unless destructive confirm)
  - return focus to trigger on close
  - aria-modal, role="dialog"
  - close button labeled
- Confirm dialogs:
  - role="alertdialog" when destructive
  - explicit confirm/cancel

### 3.4 Tabs
- role="tablist", tabs role="tab", panels role="tabpanel"
- Arrow key navigation left/right
- aria-selected and tabindex management

### 3.5 Lists and cards
- Ensure card click targets are buttons/links not divs
- Provide focus states for cards
- Avoid nested interactive elements conflicts

### 3.6 Toasts
- Use aria-live region:
  - success/info -> polite
  - errors -> assertive (sparingly)

---

## 4) Screen-level requirements
For each critical screen, ensure:
- Heading hierarchy (h1/h2)
- Main landmark (`<main>`)
- One primary CTA that is reachable and clearly labeled
- Error messages are announced (aria-live or inline)

Critical screens:
- Customer: /v/{slug}, cart, checkout, order status, settings
- Venue: login, orders queue, bell inbox, menu publish review
- Admin: login, claims list/detail, logs

---

## 5) Contrast & theming checks
For both palettes (Candlelight + Bright Bistro):
- validate contrast for:
  - body text on bg/surface
  - buttons text on primary
  - muted text on surface2
  - status pills (text vs pill background)
- adjust tokens if needed (small tweaks only)

Add a simple contrast checklist in `/docs/design/a11y-contrast.md`.

---

## 6) Reduced motion & prefers settings
- Honor `prefers-reduced-motion`:
  - disable non-essential animations
  - keep transitions minimal
- Provide optional Settings toggle:
  - “Reduce motion” (default: follow system)

---

## 7) Form usability (mobile)
- inputmode for numeric (table number, pin)
- autocomplete hints where appropriate
- error messages near field + summary at top if multiple
- no tiny tap targets; min 44px

---

## 8) Tooling & tests
Add:
- ESLint accessibility plugin (if React web) or equivalent lint rules
- A small a11y test run in CI:
  - Playwright + axe (optional) OR
  - component-level a11y checks (best effort)

At minimum:
- add a checklist and verify manually with keyboard-only.

---

## 9) Implementation sequence (in order)
1) Audit packages/ui primitives against requirements
2) Fix Sheet focus trap + return focus + Esc + labels
3) Fix Tabs ARIA + keyboard nav
4) Fix BottomNav semantics
5) Add aria-live toast region
6) Sweep key screens for headings/labels
7) Run Lighthouse a11y and fix top issues
8) Document a11y guidelines in `/docs/a11y.md`
9) Run /scope-guard

---

## 10) Acceptance criteria (measurable)
- Keyboard-only can:
  - navigate customer 2 tabs
  - add item (or equivalent) and reach checkout actions
  - venue can update order statuses
  - admin can approve claim
- Sheets trap focus and return focus correctly
- All interactive controls have accessible names
- Reduced motion is respected
- Lighthouse Accessibility score ≥ 90 on customer app (mobile)

---

## 11) Verification evidence
Provide:
- Lighthouse a11y scores (before/after if possible)
- List of components fixed
- Demo steps for keyboard-only navigation
- Tests run (commands + results)
- /scope-guard pass/fail

---

## 12) Output format (mandatory)
At end, output:
- Files changed (paths)
- Accessibility improvements summary
- Lighthouse scores
- Demo steps
- Tests run
- /scope-guard pass/fail
