# Landing Page — Implementation Tasks

## Phase 1: Foundation
- [ ] Create `apps/landing/` in monorepo (Next.js or static site)
- [ ] Setup package.json, tsconfig, build config
- [ ] Configure design tokens from `packages/ui` or create `packages/ui-landing`
- [ ] Setup `robots.txt` and `sitemap.xml` generation
- [ ] Configure Cloudflare Pages deployment

**Checkpoint**: `pnpm build` succeeds, deploy preview works.

---

## Phase 2: Core Pages (UI)
- [ ] **Home (`/`)**: Hero + CTA + trust chips + country switcher
- [ ] **Rwanda (`/rwanda`)**: Country-specific copy + venue preview
- [ ] **Malta (`/malta`)**: Country-specific copy + venue preview
- [ ] **Claim (`/claim`)**: Venue onboarding marketing page
- [ ] **Privacy (`/privacy`)**: Static legal page
- [ ] **Terms (`/terms`)**: Static legal page

**Checkpoint**: All routes render with proper layout, skeleton loading works.

---

## Phase 3: SEO Implementation
- [ ] Add `<title>` and `<meta description>` per route
- [ ] Add structured data (Organization, WebSite, FAQPage)
- [ ] Verify canonical tags on all pages
- [ ] Test with Google Rich Results Test
- [ ] Submit sitemap to Google Search Console

**Checkpoint**: Lighthouse SEO score ≥ 90.

---

## Phase 4: Performance Optimization
- [ ] Inline critical CSS for hero
- [ ] Lazy load below-fold sections
- [ ] Optimize font loading (font-display: swap)
- [ ] Test Core Web Vitals (LCP < 2.5s, CLS < 0.1)
- [ ] Add service worker for caching (if PWA-like landing)

**Checkpoint**: Lighthouse Performance score ≥ 80 on mobile.

---

## Phase 5: Polish & Deploy
- [ ] Dark mode toggle (if in scope)
- [ ] Accessibility audit (keyboard nav, contrast)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile viewport testing (iPhone SE, Android mid-range)
- [ ] Production deployment to Cloudflare Pages

**Checkpoint**: Live site passes all acceptance gates.

---

## Acceptance Gates

### Performance
- [ ] LCP < 2.5s (mobile)
- [ ] INP < 200ms
- [ ] CLS < 0.1
- [ ] Lighthouse Performance ≥ 80

### SEO
- [ ] Valid `<title>` on all pages
- [ ] Valid `<meta description>` on all pages
- [ ] Structured data validates (no errors)
- [ ] `sitemap.xml` present and valid
- [ ] `robots.txt` present

### Quality
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG AA
- [ ] No broken links
- [ ] No console errors
- [ ] Reduced motion respected
