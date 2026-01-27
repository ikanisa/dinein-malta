# Landing Page — Design Targets

## 1) Token Palette (2 Themes)

### Light Theme
| Token                | Value           | Usage                        |
|----------------------|-----------------|------------------------------|
| `--surface-primary`  | `#FFFFFF`       | Page background              |
| `--surface-glass`    | `rgba(255,255,255,0.7)` | Glass panels       |
| `--text-primary`     | `#1A1A2E`       | Headings                     |
| `--text-secondary`   | `#4A4A68`       | Body text                    |
| `--accent`           | `#6366F1`       | CTAs, links                  |
| `--accent-hover`     | `#4F46E5`       | CTA hover                    |

### Dark Theme
| Token                | Value           | Usage                        |
|----------------------|-----------------|------------------------------|
| `--surface-primary`  | `#0F0F1A`       | Page background              |
| `--surface-glass`    | `rgba(30,30,50,0.6)` | Glass panels          |
| `--text-primary`     | `#F8F8FC`       | Headings                     |
| `--text-secondary`   | `#A0A0B8`       | Body text                    |
| `--accent`           | `#818CF8`       | CTAs, links                  |
| `--accent-hover`     | `#A5B4FC`       | CTA hover                    |

---

## 2) Liquid Glass Constraints

### Blur Usage
- **Limited**: Only on hero overlays and floating CTAs.
- Max `backdrop-filter: blur(12px)` — no heavier.
- Never blur full-page backgrounds.

### Contrast Requirements
- Text on glass must meet WCAG AA (4.5:1 for body, 3:1 for large text).
- Add subtle border or shadow to glass panels for separation.

### Fallback (No backdrop-filter)
- Solid background with opacity (e.g., `rgba(255,255,255,0.95)`).
- Graceful degradation — never broken layouts.

---

## 3) Widget List (No Images Required)

### Hero "Install/Open" Dock
- Large headline + subtext
- Primary CTA button (Install App / Open App)
- Glass background, centered

### Country Switch Pill
- Inline toggle: `🇷🇼 Rwanda` | `🇲🇹 Malta`
- Switches venue preview and country context

### Venue Discovery Preview Cards
- Text-only cards (venue name, category, open/closed)
- Skeleton loading state
- Link to `/v/{slug}` (app entry)

### Trust Chips
- Short trust messages:
  - "⚡ Fast ordering"
  - "🍽️ Dine-in only"
  - "🚫 No delivery fees"

### FAQ Accordion
- Collapsible Q&A sections
- Animated expand/collapse
- Accessible keyboard nav

### CTA Rail (Sticky)
- Fixed bottom bar on mobile
- "Install App" or "Open Menu" button
- Appears after scroll

---

## 4) Typography

### Font Stack
```css
--font-sans: 'Inter', 'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'SF Mono', Consolas, monospace;
```

### Scale
| Token          | Size     | Weight | Line Height |
|----------------|----------|--------|-------------|
| `--text-hero`  | 48px     | 700    | 1.1         |
| `--text-h1`    | 32px     | 600    | 1.2         |
| `--text-h2`    | 24px     | 600    | 1.3         |
| `--text-body`  | 16px     | 400    | 1.5         |
| `--text-small` | 14px     | 400    | 1.4         |

---

## 5) Motion

### Duration Tokens
```css
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
```

### Easing
```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6) Spacing Scale
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
```

---

## 7) Breakpoints
```css
--bp-sm: 640px;
--bp-md: 768px;
--bp-lg: 1024px;
--bp-xl: 1280px;
```

- Mobile-first: base styles for < 640px.
- Tablet: 768px+.
- Desktop: 1024px+.
