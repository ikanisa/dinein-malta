---
description: 
---

---
name: /landing-ui-system-liquid-glass
description: Creates a complete landing-page UI system (tokens + components + widgets) with liquid-glass + soft gradients, while enforcing accessibility (contrast) and performance (no heavy blur). Produces a reusable component kit for the marketing site.
---

# /landing-ui-system-liquid-glass (DineIn Marketing Site)

## 0) Scope lock (non-negotiable)
This workflow creates:
- design tokens (colors, gradients, radii, shadows, blur rules)
- typography + spacing system for landing pages
- reusable components (Hero, CTA dock, FAQ accordion, feature chips, cards)
- motion rules (subtle, reduced-motion aware)

It must NOT:
- implement backend features
- add maps/location/payment APIs/scanner/delivery
- require images for core layout (images optional only)

Must be:
- mobile-first
- SEO-friendly (semantic HTML)
- accessible (glass must not reduce readability)

Important accessibility note:
Glassmorphism can harm readability if contrast is weak or backgrounds are noisy; design must include contrast and fallback rules. (Use this principle, do not cite in code.)

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Landing UI system (liquid glass)"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Deliverables (must be produced)
Create:
1) /docs/landing/design-system.md
2) packages/ui-landing/tokens/{colors.ts,gradients.ts,typography.ts,spacing.ts,radii.ts,shadows.ts,glass.ts,motion.ts}
3) packages/ui-landing/components/* (core kit)
4) packages/ui-landing/widgets/* (rich widgets)
5) /docs/landing/component-gallery.md (usage examples)

If monorepo already has packages/ui, you may:
- extend existing tokens
- or create a landing-specific layer that reuses primitives

---

## 3) Theme system (2 themes, both premium)
Define two coordinated themes:
- Theme A: Candlelight (warm amber/gold + ink + soft cream)
- Theme B: Bright Bistro (orange/gold accents + deep charcoal + clean surfaces)

Rules:
- gradients are subtle and used as backgrounds, not text fills
- avoid excessive neon
- keep text contrast strong

Include:
- background (bg0, bg1)
- surface (surface0, surface1, surfaceGlass)
- text (text0, text1, muted)
- accent (primary, secondary)
- status (success/warn/danger) minimal

---

## 4) Glass rules (must be explicit)
Create `glass.ts` rules:
- Use backdrop-filter only on large surfaces, not on text containers
- Max blur: 10–14px (cap)
- Always apply:
  - semi-opaque overlay behind text (e.g., rgba + gradient tint)
  - 1px border with low opacity
- Fallback for browsers without backdrop-filter:
  - use solid translucent surface

Never:
- put long paragraphs directly on complex gradient + glass without overlay

---

## 5) Typography & spacing (landing-specific)
- H1: strong but not huge (mobile-friendly)
- Use 4px spacing grid
- Ensure tap targets ≥ 44px
- Avoid dense blocks; keep copy skimmable

---

## 6) Component kit (must implement)
### 6.1 Layout
- PageShell (header, main, footer)
- Section (padding presets)
- Container (max widths, responsive)

### 6.2 Navigation
- TopNav (max 5 links)
- CountrySwitchPill (RW / MT)
- StickyCTARail (mobile bottom or top depending design)

### 6.3 Core marketing blocks
- HeroGlass (headline + subhead + primary CTA + secondary CTA)
- TrustChipsRow (dine-in only, fast, no delivery)
- HowItWorksSteps (3 steps max)
- FeatureCardGrid (text-first)
- FAQAccordion (SEO-friendly markup)
- FooterLinks (privacy/terms)

### 6.4 Rich widgets (no images required)
- InstallDockWidget:
  - “Open app” + “Add to Home Screen” helper
- VenuePreviewCarousel:
  - text-only cards (name, specialties chips, price band)
- PromoTicker:
  - subtle, slow, manual swipe preferred
- “ClaimVenue” Widget:
  - benefits + CTA

All widgets must be:
- accessible
- reduced-motion aware
- not blocking content

---

## 7) Motion system (subtle, premium)
- Use fade + slight slide only
- respect prefers-reduced-motion
- avoid infinite animations
- micro-interactions for buttons only (press scale 0.98)

---

## 8) SEO-friendly HTML rules (enforced in components)
- Use semantic tags: header/nav/main/section/footer
- Headings hierarchy is controlled by the page (components accept heading level)
- Avoid div-only structure
- Links must be real <a> tags (no button masquerading as link)

---

## 9) Acceptance criteria (measurable)
- Tokens exist and are used across components
- Glass effects have strict caps + readable fallback
- Component kit covers all sections needed by IA
- Widgets are rich but do not require images
- Motion is subtle and respects reduced motion
- Components generate semantic HTML

---

## 10) Verification evidence
Provide:
- paths for tokens + components
- screenshots of component gallery page
- contrast sanity check notes (at least manual)
- Lighthouse Accessibility quick score for landing page (if setup exists)
- /scope-guard pass/fail

---

## 11) Output format (mandatory)
At end, output:
- Files created/changed (paths)
- Component list
- Widget list
- Notes on glass fallback + motion rules
- Tests run (if any)
- /scope-guard pass/fail
- Next workflow recommendation: /landing-build-nextjs-seo-foundation
