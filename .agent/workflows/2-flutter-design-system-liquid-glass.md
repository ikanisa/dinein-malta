---
description: 
---

---
name: /flutter-design-system-liquid-glass
description: Builds the complete Flutter design system for the Customer app: tokens, themes (light/dark), liquid-glass rules, typography, spacing, and a reusable widget kit that matches the customer PWA vibe while staying fast and accessible.
---

# /flutter-design-system-liquid-glass (Customer Flutter App)

## 0) Scope lock (non-negotiable)
This workflow creates:
- design tokens (colors, gradients, radii, shadows, blur caps)
- Flutter ThemeData (light + dark)
- reusable widgets (cards, chips, buttons, list tiles, app bars, bottom nav)
- rich widgets used by Home + Venue Menu (text-first, no images required)
- motion rules (subtle, reduced motion)

It must NOT:
- build business logic (orders, deep links, data layer)
- introduce images as a dependency for the UI
- add maps/location/payment APIs/scanner/delivery
- create extra screens or journeys

Design requirements:
- liquid-glass + soft gradients
- premium, modern, minimalist
- high legibility; glass cannot reduce readability
- excellent performance (avoid heavy blur everywhere)

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Flutter design system (liquid glass)"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Folder structure (must create)
In `apps/flutter_customer/lib/core/design/` create:
- tokens/
  - colors.dart
  - gradients.dart
  - typography.dart
  - spacing.dart
  - radii.dart
  - shadows.dart
  - glass.dart
  - motion.dart
- theme/
  - theme_light.dart
  - theme_dark.dart
  - theme.dart
- widgets/
  - buttons/
  - cards/
  - chips/
  - lists/
  - surfaces/
  - nav/
  - feedback/ (toasts/snackbars, skeletons)

Also create:
- `apps/flutter_customer/lib/core/design/gallery/design_gallery_screen.dart`
  (a component preview screen for QA)

---

## 3) Token system (2 coordinated themes)
Define two coordinated “moods” that you can switch by config:
- Candlelight (warm amber/gold + ink + cream)
- Bright Bistro (orange/gold accents + deep charcoal + clean surfaces)

Tokens must include:
- background0/background1
- surface0/surface1/surfaceGlass
- text0/text1/muted
- accentPrimary/accentSecondary
- borders/dividers
- status (success/warn/danger) minimal

Typography:
- 3–4 levels only (H1, H2, body, small)
- strong readability on mobile
- no thin weights for important labels

Spacing:
- 4dp grid
- standard paddings (8/12/16/20/24)

Radii:
- 14–24 for premium cards
- small radius for chips (999 for pills)

---

## 4) Glass rules (must be explicit + enforced)
In `glass.dart` define a single API for glass surfaces:
- blur cap: 10–14 (never higher)
- overlay tint ALWAYS applied behind text (semi-opaque)
- 1dp border with low opacity
- shadows must be soft and minimal

Hard rules:
- Do not stack multiple glass layers
- Do not animate blur
- Do not put long text blocks directly on busy gradients without overlay
- Provide fallback style if blur is disabled (solid translucent surface)

---

## 5) Motion rules (subtle + reduced motion)
In `motion.dart`:
- default durations: 120–180ms
- curves: easeOut
- use small fades and slight slides only
- respect reduced motion setting:
  - create a single `bool reduceMotion` flag you can wire later

---

## 6) Core widgets (must implement)
### 6.1 App shell widgets
- `DineInScaffold` (safe area handling, background gradient)
- `DineInBottomNav` (2 tabs: Home, Settings)
- `GlassAppBar` (optional, minimal)
- `StickyActionRail` (optional for later: cart pill / CTA)

### 6.2 Surfaces & layout
- `GlassCard`
- `SurfaceCard`
- `SectionHeader`
- `DividerSoft`
- `InsetContainer` (consistent paddings)

### 6.3 Inputs and controls
- `PrimaryButton`, `SecondaryButton`, `GhostButton`
- `PillChip` (selected/unselected)
- `QuantityStepper` (for cart)
- `SearchField` (for venue list; later)

### 6.4 List & preview widgets (text-first)
- `VenuePreviewCard` (name, specialties chips, price band, open/closed optional)
- `MenuItemTile` (name, price, chips, add button)
- `PromoStrip` (text + icon only)
- `SkeletonList` / `SkeletonCard`

### 6.5 Feedback
- `Toast/Snackbar` styling
- `EmptyState` (minimal copy + CTA)

No images required. Icons allowed but must be minimal and consistent.

---

## 7) Accessibility baseline (must check)
- tap targets >= 44dp
- contrast: text0 must be readable on glass surfaces
- focus/semantics labels for buttons and important elements
- do not rely on color alone for selection state (use shape/outline)

---

## 8) Design gallery (for QA)
Implement `DesignGalleryScreen`:
- shows tokens preview (colors, gradients)
- shows all core widgets
- includes “Light/Dark” toggle
- includes “Candlelight/Bright Bistro” toggle (if both shipped)

---

## 9) Acceptance criteria (measurable)
- ThemeData light/dark works with no missing colors
- Glass surfaces follow caps and include overlay tint
- Widget kit exists for Home + Venue Menu + Cart needs
- Design gallery screen builds and renders
- No images required to look premium
- No extra screens or business logic added

---

## 10) Verification evidence
Provide:
- file paths created
- screenshots of design gallery (light/dark)
- notes on blur cap + fallback behavior
- /scope-guard pass/fail

---

## 11) Output format (mandatory)
At end, output:
- Files created/changed (paths)
- Widget list summary
- Theme/tokens summary
- Next workflow recommendation: /flutter-routing-and-deep-links
- /scope-guard pass/fail
