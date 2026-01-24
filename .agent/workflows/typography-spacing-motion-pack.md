---
description: 
---

---
name: /typography-spacing-motion-pack
description: Defines a minimal typography scale, spacing system, and micro-motion rules that make the PWAs feel native and premium without images. Adds shared tokens + components behaviors in packages/ui.
---

# /typography-spacing-motion-pack (DineIn)

## 0) Scope (hard-locked)
This workflow defines/standardizes:
- typography tokens + usage
- spacing tokens + layout templates
- micro-motion rules (subtle)
- haptics/sound patterns (best-effort, no permissions)

It must NOT:
- add product features
- add new screens/flows
- introduce heavy animation libs without justification

Must preserve:
- minimal UI, rich widgets
- 4-tap ordering
- customer 2-tab nav

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Typography + spacing + motion pack"
Output must include:
- Scope lock + exclusions
- Plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Typography system (simple, consistent)
Create `packages/ui/tokens/typography.ts` with:

### 2.1 Font stack (safe + fast)
- system UI stack first:
  - ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial
- optionally add one variable font later (out of scope for v1)

Rules:
- No more than 2 font families.
- Prefer readability over “fancy”.

### 2.2 Type scale (mobile-first)
Define semantic sizes:
- titleLg (screen title)
- titleMd (section header)
- body (default)
- bodySm (supporting text)
- caption (meta)
- monoSm (codes/IDs if needed)

Recommended scale (CSS px):
- titleLg: 22–24
- titleMd: 16–18
- body: 14–16
- bodySm: 13–14
- caption: 11–12

### 2.3 Line height + weight
- title: 1.15–1.25
- body: 1.35–1.5
Weights:
- regular 400
- medium 500
- semibold 600

Rules:
- Use semibold sparingly.
- Avoid ALL CAPS except tiny badges.

---

## 3) Spacing + layout system (4px grid)
Create `packages/ui/tokens/spacing.ts`:

### 3.1 Spacing scale (4px base)
- 0, 4, 8, 12, 16, 20, 24, 32, 40, 48

### 3.2 Container + safe areas
- content max width (mobile): 520–640px
- default horizontal padding: 16px
- bottom safe area padding for nav + cart pill

Rules:
- No screen should feel “edge-to-edge cramped”.
- Keep list items tappable: min 44px height.

---

## 4) Motion system (subtle, native-feel)
Create `packages/ui/tokens/motion.ts`:

### 4.1 Durations
- fast: 120ms
- normal: 180ms
- slow: 240ms

### 4.2 Easing (standard)
- easeOut for entering
- easeIn for exiting
- easeInOut for transforms

### 4.3 Allowed motions (only these)
- fade
- slide-up (bottom sheet)
- micro-scale (button press 0.98–1.0)
- soft pulse (badge/bell indicator)

Rules:
- No “bouncy” cartoon transitions.
- No continuous animations that distract.
- Motion must never block interactions.

---

## 5) Component behavior standards (packages/ui)
Update shared components to follow:
- Button press: micro-scale + subtle shadow change
- Sheet: slide-up + scrim fade
- Toast: slide-down + auto-dismiss
- List item: active highlight on tap
- Cart pill: gentle appear/disappear (fade + slide)

---

## 6) “Haptics” and sound (best effort, no permissions)
Browsers are limited; keep it graceful:
- Use `navigator.vibrate(10)` only if available (no prompts)
- Use in-app sound only if user has interacted (autoplay rules)

Apply to:
- Venue bell: optional vibration on new bell call while app is open
- Status update success: tiny vibration
- Error: no vibration, just toast

Provide a Settings toggle:
- “Vibrate on alerts” (default off on iOS if unreliable)

---

## 7) Proof screens (must demonstrate)
Refactor/verify these screens with the new pack:
- Customer: /v/{slug} menu (typography hierarchy + spacing + cart pill motion)
- Venue: orders queue (status pills + list spacing)
- Admin: claims list (density + readability)

No new features, just consistency.

---

## 8) Implementation sequence (in order)
1) Add typography/spacing/motion token files
2) Wire them into UI primitives (Button, Card, Sheet, Toast, Chips)
3) Add safe-area utilities for bottom nav + cart pill
4) Add micro-motion helpers (CSS classes or minimal util)
5) Add optional vibrate helper + toggle
6) Update proof screens
7) Document in /docs/design/typography-spacing-motion.md
8) Run /scope-guard

---

## 9) Acceptance criteria (measurable)
- Typography tokens exist and are used by shared components
- Spacing is consistent across proof screens
- Motion is subtle and consistent (no random transitions)
- Tap targets meet ≥44px
- Cart pill and sheets animate smoothly
- No heavy animation library added
- No product scope changes

---

## 10) Verification evidence
Provide:
- Token file paths
- Screenshot set of proof screens
- Quick video/GIF optional (if tooling allows)
- Notes on motion/haptic behavior by platform (iOS/Android)
- /scope-guard pass/fail

---

## 11) Output format (mandatory)
At end, output:
- Files created/changed (paths)
- Token summary (type/spacing/motion)
- Components updated
- Screens updated as proof
- /scope-guard pass/fail
