---
description: 
---

---
name: /anti-chaos-ui-system
description: Establishes a single shared UI system (tokens + components + widget patterns) to keep customer/venue/admin consistent, minimal, and rich. Prevents UI drift in a monorepo.
---

# /anti-chaos-ui-system

## 0) Scope (hard-locked)
This workflow creates/standardizes:
- design tokens
- shared components
- widget patterns
- interaction rules (bottom sheets, sticky cart pill, chips, skeletons)

It must NOT add product features (no new flows).
It must preserve:
- 2-tab customer nav
- /v/{slug} deep link entry
- 4-tap ordering requirement

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Shared UI system"
Output must include:
- Scope lock + exclusions
- Plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Token system (single source of truth)
Create tokens in packages/ui:

### 2.1 Color tokens (dine-in feel, no photos needed)
Provide two approved themes:
- Theme A: Candlelight Modern (dark/amber/gold)
- Theme B: Bright Bistro (cream/orange/gold)

Tokens required:
- bg, surface, surface2
- text, textMuted
- border, divider
- primary, primaryHover, primaryActive
- success, danger, warning
- focus ring

Rules:
- No raw hex sprinkled through apps; use tokens only.
- Keep contrast acceptable.

### 2.2 Radius / shadow / blur tokens ("liquid glass")
- radius: sm, md, lg, xl, 2xl
- shadow: soft, card, floating
- blur: glassSm, glassMd

### 2.3 Spacing & typography tokens
- spacing scale (4px grid)
- typography scale (xs..2xl)
- line heights
- font weights

---

## 3) Shared components (packages/ui)
Build these primitives first:

### 3.1 Primitives
- AppShell (top area + content + bottom nav slot)
- BottomNav (2-tab variant + 4-tab variant for venue/admin if needed)
- Card (glass + solid variants)
- Button (primary/secondary/ghost/destructive)
- Input, PinInput (4-digit)
- Sheet (bottom sheet)
- Dialog (rare; destructive only)
- Toast system
- Skeleton
- Badge / StatusPill
- Chips (category chips)
- ListRow / ListCard

Rules:
- All components support:
  - loading
  - disabled
  - keyboard focus
  - className override

---

## 4) Shared “Rich Widgets” (the stuff that makes it feel native)
Implement these as composable widgets:

### 4.1 Sticky Cart Pill (customer)
- Visible when cart count > 0
- Shows item count + subtotal
- One-tap opens cart

### 4.2 Order Timeline Widget
- Placed → Received → Served / Cancelled
- Shows timestamps if available
- Works in customer and venue views

### 4.3 Venue Amenity Grid
- Icon + label chips
- No photos needed

### 4.4 Promo Card
- Gradient border + minimal copy
- Optional expiry text

### 4.5 Bell Alert Widget (venue)
- New bell calls count
- One-tap to inbox
- Subtle “pulse” animation

---

## 5) Interaction patterns (strict)
Define and enforce patterns to reduce cognitive load:

### 5.1 Bottom sheets (default)
- Item details
- Filters
- Order detail quick view
- QR download actions

### 5.2 One primary CTA per screen
- Any second action is “ghost” or tucked away.

### 5.3 Loading patterns
- Use skeletons, not spinners, on primary screens.

### 5.4 Empty states
- Short, neutral copy
- Provide one action (e.g., “Browse venues”)

---

## 6) Screen templates (mobile-first)
Provide templates in packages/ui:

- ListScreenTemplate (header + search + list)
- DetailScreenTemplate (header + sections)
- FormScreenTemplate (stacked fields + sticky save)
- QueueScreenTemplate (tabs + list + detail sheet)

Apps must compose these rather than reinvent layouts.

---

## 7) Do-not-do list (prevents UI drift)
- Do not introduce new colors outside tokens.
- Do not create app-specific buttons unless approved.
- Do not add images/photos as a dependency for “richness”.
- Do not add a third tab in customer nav.
- Do not add new order statuses.

---

## 8) Implementation sequence (apply in order)
1) Create tokens + theming switch (internal, default to Theme A)
2) Build primitives (Card/Button/Input/Sheet/Skeleton/Toast)
3) Build widgets (CartPill/Timeline/AmenityGrid/PromoCard/BellWidget)
4) Create screen templates
5) Refactor 1–2 key screens in customer to use the system (proof)
6) Document UI rules in /docs/ui-system.md
7) Add lint rule or checklist to prevent raw colors (best effort)
8) Run /scope-guard

---

## 9) Acceptance criteria (measurable)
- No raw hex codes in app UIs (tokens only)
- Customer ordering still ≤ 4 taps
- Customer nav remains 2 tabs
- Menu screen has sticky cart pill
- All primary screens use skeleton loaders
- Consistent bottom sheet behavior across apps

---

## 10) Verification evidence
- screenshot set showing:
  - venue menu (with cart pill)
  - checkout
  - venue dashboard
  - admin claims list
- quick note listing components used and where
- grep proof (or lint) that raw hex is minimized

---

## 11) Output format (mandatory)
At end, output:
- Files added/changed (paths)
- Tokens summary
- Components list (what exists)
- Widgets list
- Screens refactored as proof
- /scope-guard pass/fail

