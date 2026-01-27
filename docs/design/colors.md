# DineIn Design System: Colors & Tokens

## Overview

This design system implements a **"Soft Liquid Glass"** aesthetic with two distinct palettes.
It avoids photos/images in favor of rich gradients, glassmorphism, and typography.

---

## The Two Approved Palettes

### Palette A: Candlelight Modern (Default / Dark)

*Feels like candlelight + polished wood + amber glass. Premium dine-in.*

#### Semantic Colors

| Token | Value | Purpose |
|-------|-------|---------|
| `bg` | `#0B0B0E` | Page background |
| `bg2` | `#0F1015` | Secondary background |
| `surface` | `#12131A` | Card/container background |
| `surface2` | `#161825` | Elevated surface |
| `surface3` | `#1B1F2E` | Highest elevation |
| `text` | `#F4F1EA` | Primary text |
| `textMuted` | `#B9B4A7` | Secondary text |
| `textSubtle` | `#8E889A` | Hint text |
| `border` | `#26283A` | Borders |
| `divider` | `#1E2030` | Divider lines |
| `primary` | `#FF7A1A` | Amber orange (CTAs) |
| `primaryHover` | `#FF8E3A` | Hover state |
| `primaryActive` | `#F06A10` | Active/pressed |
| `gold` | `#D7B45A` | Secondary accent |
| `focusRing` | `#FFB15C` | Focus indicator |

#### Status Colors

| Token | Value | Purpose |
|-------|-------|---------|
| `success` | `#2ECC71` | Success states |
| `warning` | `#F5A524` | Warning states |
| `danger` | `#FF4D4F` | Error/destructive |
| `info` | `#3BA7FF` | Informational |

#### Overlays

| Token | Value |
|-------|-------|
| `scrim` | `rgba(0,0,0,0.55)` |
| `overlay` | `rgba(18,19,26,0.72)` |

#### Glass Recipe

| Token | Value |
|-------|-------|
| `glassBg` | `rgba(18,19,26,0.62)` |
| `glassBorder` | `rgba(255,255,255,0.08)` |
| `glassHighlight` | `rgba(255,122,26,0.12)` |
| blur | `14–18px` |

#### Gradients

| Token | Value |
|-------|-------|
| `primary` | `linear-gradient(135deg, #FF7A1A 0%, #D7B45A 55%, #FF7A1A 100%)` |
| `cardEdge` | `linear-gradient(180deg, rgba(255,122,26,0.25), rgba(215,180,90,0.10))` |
| `subtle` | `linear-gradient(180deg, rgba(255,122,26,0.10), rgba(0,0,0,0.0))` |

---

### Palette B: Bright Bistro (Light)

*Feels like a clean bistro menu + warm sunlight. Still premium.*

#### Semantic Colors

| Token | Value | Purpose |
|-------|-------|---------|
| `bg` | `#FCFAF6` | Page background |
| `bg2` | `#F7F2EA` | Secondary background |
| `surface` | `#FFFFFF` | Card/container background |
| `surface2` | `#FFF8EE` | Elevated surface |
| `surface3` | `#F2EEE7` | Highest elevation |
| `text` | `#141318` | Primary text |
| `textMuted` | `#4E4B57` | Secondary text |
| `textSubtle` | `#7A7685` | Hint text |
| `border` | `#E6DFD4` | Borders |
| `divider` | `#EFE7DC` | Divider lines |
| `primary` | `#FF6A00` | Vibrant orange (CTAs) |
| `primaryHover` | `#FF7B24` | Hover state |
| `primaryActive` | `#E95F00` | Active/pressed |
| `gold` | `#C9A44A` | Secondary accent |
| `focusRing` | `#FF9A4A` | Focus indicator |

#### Status Colors

| Token | Value | Purpose |
|-------|-------|---------|
| `success` | `#16A34A` | Success states |
| `warning` | `#D97706` | Warning states |
| `danger` | `#DC2626` | Error/destructive |
| `info` | `#2563EB` | Informational |

#### Overlays

| Token | Value |
|-------|-------|
| `scrim` | `rgba(20,19,24,0.28)` |
| `overlay` | `rgba(255,255,255,0.75)` |

#### Glass Recipe

| Token | Value |
|-------|-------|
| `glassBg` | `rgba(255,255,255,0.65)` |
| `glassBorder` | `rgba(20,19,24,0.10)` |
| `glassHighlight` | `rgba(255,106,0,0.10)` |
| blur | `12–16px` |

---

## Country Accents (Subtle Only)

Use sparingly: badge edges, promo card stripes, country indicators.

| Country | Token | Value |
|---------|-------|-------|
| Rwanda | `rwAccent` | `rgba(46,204,113,0.18)` |
| Malta | `mtAccent` | `rgba(59,167,255,0.18)` |

> **Rule**: Never recolor primary buttons by country.

---

## Component Usage Guide

### Primary CTA Button

```css
background: var(--primary);
color: var(--background); /* or text, check contrast */
```
- Hover: `primaryHover`
- Active: `primaryActive`
- Focus: `2px solid focusRing`

### Cards / List Items

```css
background: var(--surface); /* or glassBg for glass cards */
border: 1px solid var(--border); /* or glassBorder */
```
- Optional: `gradientCardEdge` on card edge only

### Bottom Sheets

```css
background: var(--surface2); /* or overlay for glass */
```
- Backdrop: `scrim`

### Chips (Categories)

- Default: `surface3` + `border`
- Selected: subtle `gradientSubtle` + `border` + `text`

### Status Pills

- Background: status color at 15–22% alpha
- Text/icon: solid status color

---

## Do Not Do

- ❌ Raw hex in app code (only tokens)
- ❌ More than 2 gradients per screen
- ❌ Full-screen gradient behind text
- ❌ Neon saturation ("gaming UI" vibe)
- ❌ Images required to "feel premium"

---

## Implementation

| Item | Location |
|------|----------|
| **Token source** | `packages/ui/src/tokens/colors.ts` |
| **Gradients** | `packages/ui/src/tokens/gradients.ts` |
| **ThemeProvider** | `packages/ui/src/components/theme/ThemeProvider.tsx` |
| **Blur tokens** | `packages/ui/src/tokens/blur.ts` |

Theme switching uses `ThemeProvider` with `localStorage` persistence.
CSS variables are injected at runtime for both Shadcn compatibility and DineIn premium tokens.
