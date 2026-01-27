# Typography, Spacing, and Motion

This design system pack standardizes the foundational elements of the DineIn PWAs to ensure a consistent, native-app-like feel.

## 1. Typography
We use a semantic type scale to maintain hierarchy.

**Font Stack:** `Inter, system-ui, -apple-system, sans-serif`

| Token | Size / Line-Height | Weight | Usage |
|-------|-------------------|--------|-------|
| `titleLg` | 24px / 1.25 | SemiBold (600) | Main screen titles |
| `titleMd` | 18px / 1.25 | SemiBold (600) | Section headers, card titles |
| `body` | 16px / 1.5 | Regular (400) | Default text, descriptions |
| `bodySm` | 14px / 1.4 | Regular (400) | Secondary text, meta info |
| `caption` | 12px / 1.4 | Regular (400) | Tiny labels, timestamps |
| `monoSm` | 12px / 1.4 | Regular (400) | Order IDs, codes |

**Usage:**
```tsx
import { TYPOGRAPHY } from '@dinein/ui';

// Using constants
<h1 style={TYPOGRAPHY.semantic.titleLg}>Title</h1>

// Using Tailwind classes (mapped in index.css)
<h1 className="text-2xl font-semibold">Title</h1>
```

---

## 2. Spacing & Layout
Based on a 4px grid.

**Scale:**
`px` (1px), `1` (4px), `2` (8px), `3` (12px), `4` (16px) ... `12` (48px)

**Layout Constants:**
| Token | Value | Description |
|-------|-------|-------------|
| `LAYOUT.containerMaxWidth` | 640px | Max width for mobile-first content |
| `LAYOUT.horizontalPadding` | 16px | Default screen padding |
| `LAYOUT.safeAreaBottom` | 84px | Padding for fixed bottom nav + cart pill |
| `LAYOUT.minTapTarget` | 44px | Minimum touch target size |

**Usage:**
```tsx
import { LAYOUT } from '@dinein/ui';

<div style={{ paddingBottom: LAYOUT.safeAreaBottom }}>
  Content that won't be hidden by bottom nav
</div>
```

---

## 3. Motion (Micro-interactions)
Subtle, purposeful motion. No decorative continuous animations.

**Durations:**
- `fast`: 120ms (0.12s) - Micro-interactions (toggles, checks)
- `normal`: 180ms (0.18s) - UI transitions (hover, press)
- `slow`: 240ms (0.24s) - Entry/exit animations

**Standard Animations:**
- **Fade In:** Simple opacity transition.
- **Slide Up:** For Bottom Sheets and entry cards.
- **Scale:** Micro-scale (0.96) on button press.

**Accessibility:**
- Respects `prefers-reduced-motion`.
- All `motion.*` components should check `useReducedMotion()` or use `getAccessibleVariants()`.

---

## 4. Haptics
Best-effort vibration for key interactions. Controlled by user preference.

**Patterns:**
- `light` (10ms): Button taps, toggle switches.
- `success` (10-30-10ms): Action completed.
- `error` (50-100-50ms): Critical error.
- `warning` (30-50-10ms): Warning state.

**Usage:**
```tsx
const { trigger } = useHaptics();

<button onClick={() => {
  trigger('light');
  submitAction();
}}>Click me</button>
```
