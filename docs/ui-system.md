# DineIn UI System Documentation

This document describes the unified UI system for the DineIn monorepo. All apps (customer, venue, admin) should use these shared components, tokens, and patterns to maintain consistency and prevent UI drift.

---

## Design Principles

### 1. Minimal but Rich
- Clean hierarchy, generous spacing, simple components
- No photos required - richness comes from motion, color, and spacing
- Premium feel through polish, not complexity

### 2. Mobile-First
- Touch-first interactions (large tap targets, swipe gestures)
- Thumb-reachable navigation
- Native-app-like experience

### 3. Token-Driven
- All colors, spacing, and typography via design tokens
- No raw hex codes in app components
- CSS variables enable theming

### 4. Component-First
- Use shared primitives from `@dinein/ui`
- Avoid app-specific button/input variations
- Extend via `className`, not duplication

---

## Token System

All tokens are defined in `packages/ui/src/tokens/`.

### Color Palettes

Two approved themes:
- **Candlelight** (default): Dark theme with amber/gold accents
- **Bistro**: Light theme with warm orange accents

| Token | Purpose |
|-------|---------|
| `bg` | Page background |
| `surface`, `surface2`, `surface3` | Card/container surfaces |
| `text`, `textMuted`, `textSubtle` | Text hierarchy |
| `border`, `divider` | Borders and separators |
| `primary`, `primaryHover`, `primaryActive` | Primary actions |
| `success`, `warning`, `danger`, `info` | Semantic colors |
| `focusRing` | Focus state |
| `glassBg`, `glassBorder` | Glass morphism |

### Spacing

4px grid system via `packages/ui/src/tokens/spacing.ts`:
- Use spacing tokens: `1` = 0.25rem, `2` = 0.5rem, `4` = 1rem, etc.
- Safe area tokens: `safe-top`, `safe-bottom` for notched devices

### Typography

Font stack: Inter (sans), JetBrains Mono (mono)

Semantic scale:
- `titleLg` (24px), `titleMd` (18px)
- `body` (16px), `bodySm` (14px)
- `caption` (12px), `monoSm` (12px mono)

### Shadows & Blur

- Shadows: `sm`, `md`, `lg`, `xl`, `glass`
- Blur: `sm` (4px), `md` (8px), `glass` (14px)

---

## Component Inventory

### Primitives (`packages/ui/src/components/ui/`)

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Button` | Actions | variant, loading, disabled |
| `Badge` | Status indicators | variant |
| `Input` | Text input | error, disabled |
| `PinInput` | 4-digit PIN entry | length, mask, error |
| `Card` | Surface container | variant, onClick |
| `GlassCard` | Glass morphism card | depth |
| `BottomSheet` | Modal sheet | isOpen, onClose |
| `DraggableBottomSheet` | Swipeable sheet | snapPoints |
| `Dialog` | Confirmation modal | open, onClose |
| `Toast` | Notifications | via useToast hook |
| `Skeleton` | Loading placeholder | className |
| `EmptyState` | Empty list states | icon, title, action |
| `Chips` | Category filters | options, value, onChange |
| `ListRow` | List item | title, subtitle, leading, trailing |
| `AppShell` | Page layout | header, bottomNav |
| `BottomNav` | Navigation | tabs, activeTab |

### Widgets (`packages/ui/src/widgets/`)

| Widget | Purpose | Used In |
|--------|---------|---------|
| `CartPill` | Floating cart button | Customer menu |
| `OrderProgressTimeline` | Order status track | Customer/venue order view |
| `BellAlertPulse` | Notification indicator | Venue dashboard |
| `PromoTicker` | Scrolling promos | Customer home |
| `PromoCard` | Promotional card | Customer home |
| `VenueAmenityGrid` | Amenity chips | Venue detail |
| `OrdersQueueTabs` | Order queue tabs | Venue dashboard |
| `TableNumberSheet` | Table selection | Customer checkout |
| `QuickAddBar` | Category quick nav | Customer menu |
| `InstallHintChip` | PWA install prompt | After engagement |

### Screen Templates (`packages/ui/src/templates/`)

| Template | Purpose | Use Case |
|----------|---------|----------|
| `ListScreenTemplate` | Header + search + list | Venues list, order history |
| `DetailScreenTemplate` | Header + hero + sections | Venue detail, order detail |
| `FormScreenTemplate` | Header + fields + sticky save | Profile edit, claim form |
| `QueueScreenTemplate` | Tabs + list + detail sheet | Venue orders, admin claims |

---

## Interaction Patterns

### Bottom Sheets (Default for Details)
Use for:
- Item details/customization
- Filters
- Order quick view
- QR download actions

### One Primary CTA Per Screen
- Primary action = primary button
- Secondary actions = ghost or minimal

### Loading States
- Use `Skeleton` on primary screens
- Use spinner only for inline actions
- Never leave screens blank during fetch

### Empty States
- Use `EmptyState` component
- Short, neutral copy
- Single action (e.g., "Browse venues")

---

## Customer App Invariants

> These MUST NOT change:

1. **2-Tab Navigation**: Home + Settings only
2. **4-Tap Ordering**: Add → Cart → Checkout → Place
3. **Sticky Cart Pill**: Visible when cart has items
4. **Deep Link Entry**: `/v/{venueSlug}` loads venue menu

---

## Do-Not-Do List

❌ **Do NOT** introduce raw hex colors in app components
❌ **Do NOT** create app-specific button/input variants
❌ **Do NOT** add images/photos as dependency for richness
❌ **Do NOT** add a third tab in customer nav
❌ **Do NOT** add order statuses beyond: Placed, Received, Served, Cancelled
❌ **Do NOT** use inline styles - use tokens/classes
❌ **Do NOT** skip loading states

---

## Usage Examples

### Using BottomNav

```tsx
import { BottomNav, type NavTab } from '@dinein/ui';
import { Home, Settings } from 'lucide-react';

const tabs: NavTab[] = [
  { id: 'home', label: 'Home', icon: Home, href: '/' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

<BottomNav tabs={tabs} />
```

### Using Toast Notifications

```tsx
import { ToastProvider, useToast } from '@dinein/ui';

// Wrap app with provider
<ToastProvider>
  <App />
</ToastProvider>

// Use in component
function MyComponent() {
  const toast = useToast();
  
  const handleSuccess = () => {
    toast.success('Order placed successfully!');
  };
}
```

### Using Screen Templates

```tsx
import { ListScreenTemplate, EmptyState } from '@dinein/ui';
import { Search } from 'lucide-react';

function VenuesList() {
  return (
    <ListScreenTemplate
      title="Venues"
      searchPlaceholder="Search venues..."
      searchValue={query}
      onSearchChange={setQuery}
      loading={isLoading}
      isEmpty={venues.length === 0}
      emptyState={<EmptyState icon={Search} title="No venues found" />}
    >
      {venues.map(v => <VenueCard key={v.id} venue={v} />)}
    </ListScreenTemplate>
  );
}
```

---

## Verification Checklist

When adding/modifying UI:

- [ ] Uses tokens for colors (no raw hex)
- [ ] Uses shared components from @dinein/ui
- [ ] Has loading state
- [ ] Has empty state (if list)
- [ ] Has error state
- [ ] Works on mobile viewport
- [ ] Preserves tap budget (customer ordering)
- [ ] Preserves nav tab count (customer = 2)
