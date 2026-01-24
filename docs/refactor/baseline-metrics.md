# DineIn Refactor — Baseline Metrics

> **Phase A Deliverable** — Captured before any refactor work  
> Generated: 2026-01-24

---

## Build Metrics

| App | TypeScript | Vite Build | Bundle Size (gzip) | Precache | Status |
|-----|------------|------------|-------------------|----------|--------|
| **customer** | ✅ Pass | 20.84s | ~140KB | 418 KB | ✅ Healthy |
| **venue** | ✅ Pass | 28.45s | ~160KB | 624 KB | ✅ Healthy |
| **admin** | ✅ Pass | 36.14s | ~162KB | 557 KB | ✅ Healthy |

---

## Bundle Breakdown (Customer App)

| Chunk | Raw Size | Gzip |
|-------|----------|------|
| `vendor.js` | 162.54 KB | 53.05 KB |
| `framer-motion.js` | 117.05 KB | 38.38 KB |
| `index.js` (app code) | 94.40 KB | 27.86 KB |
| `lucide-icons.js` | 9.83 KB | 2.34 KB |
| `radix-ui.js` | 2.97 KB | 1.42 KB |
| `index.css` | 35.10 KB | 7.48 KB |
| **Total (approx)** | ~422 KB | ~130 KB |

### Observations
- `framer-motion` is 28% of JS bundle — evaluate if all features used
- `vendor.js` includes React, ReactDOM, react-router-dom
- App code is ~22% of bundle — good ratio

---

## Bundle Breakdown (Venue App)

| Chunk | Raw Size | Gzip |
|-------|----------|------|
| `supabase.js` | 172.93 KB | 44.70 KB |
| `vendor.js` | 162.54 KB | 53.05 KB |
| `framer-motion.js` | ~117 KB | ~38 KB |
| App + UI code | ~171 KB | ~52 KB |
| **Total (approx)** | ~624 KB | ~188 KB |

### Observations
- `supabase.js` chunk not split in customer app — venue uses heavier Supabase features
- Larger than customer due to menu management, KDS, OCR pipeline

---

## Bundle Breakdown (Admin App)

| Chunk | Raw Size | Gzip |
|-------|----------|------|
| `supabase.js` | 172.49 KB | 44.54 KB |
| `vendor.js` | 162.42 KB | 53.01 KB |
| `framer-motion.js` | ~117 KB | ~38 KB |
| App code | ~105 KB | ~32 KB |
| **Total (approx)** | ~557 KB | ~168 KB |

### Observations
- Similar to venue but smaller app code (fewer pages)
- `date-fns` added for audit logs (not in customer/venue)

---

## Lint Status

| App | Errors | Warnings | Status |
|-----|--------|----------|--------|
| customer | 0 | ~50 allowed | ✅ |
| venue | 0 | ~50 allowed | ✅ |
| admin | 0 | ~50 allowed | ✅ |
| packages/ui | 0 | 0 | ✅ |
| packages/db | 0 | 0 | ✅ |

> Note: Legacy `dinein-web` app has 4 errors and 13 warnings but is not part of the 3-app monorepo structure.

---

## Test Coverage

| Area | Unit Tests | Integration | E2E | Status |
|------|------------|-------------|-----|--------|
| packages/core | ❌ None | ❌ None | — | ⚠️ Gap |
| packages/db | Has vitest | ❌ None | — | ⚠️ Gap |
| packages/ui | ❌ None | ❌ None | — | ⚠️ Gap |
| apps/customer | ❌ None | ❌ None | ❌ None | ⚠️ Gap |
| apps/venue | ❌ None | ❌ None | ❌ None | ⚠️ Gap |
| apps/admin | ❌ None | ❌ None | ❌ None | ⚠️ Gap |

> [!IMPORTANT]  
> No E2E tests exist. This is a critical gap for refactor safety.

---

## Lighthouse Estimates (Customer App)

> Lighthouse not run; estimates based on bundle analysis

| Metric | Estimate | Target | Notes |
|--------|----------|--------|-------|
| Performance | ~70-80 | 90+ | framer-motion may delay LCP |
| Accessibility | ~85-90 | 95+ | Need audit |
| Best Practices | ~90 | 95+ | PWA setup looks solid |
| SEO | ~80 | 90+ | Missing meta tags |

**Recommendation:** Run Lighthouse on deployed customer app before Slice 1

---

## File Counts

| Area | Count | Trend Target |
|------|-------|--------------|
| Total source files | ~300 | Reduce by consolidation |
| Duplicate CSS files | 3 (36KB each) | Consolidate to 1 in packages/ui |
| Duplicate design-system folders | 2 (venue, admin) | Remove, use packages/ui |
| Migrations | 39 | Keep, no reduction needed |
| Edge functions | 18 | Audit for scope violations |

---

## Dependencies

| Package | Version | Apps | Issue |
|---------|---------|------|-------|
| framer-motion | 12.29.0 | all 3 | Large bundle; review usage |
| recharts | 3.7.0 | all 3 | Only used in venue Overview |
| react-window | 2.2.5 | all 3 | Not clearly used |
| @hello-pangea/dnd | 18.0.1 | all 3 | Only used in menu reordering |
| qrcode | 1.5.4 | all 3 | Only used in venue Settings |

> [!TIP]  
> Consider lazy-loading recharts, react-window, @hello-pangea/dnd, qrcode

---

## Commands Reference

```bash
# Full monorepo build
pnpm build

# Individual app builds
pnpm --filter dinein-customer build
pnpm --filter dinein-venue build
pnpm --filter dinein-admin build

# Lint
pnpm lint

# Dev servers
pnpm --filter dinein-customer dev
pnpm --filter dinein-venue dev
pnpm --filter dinein-admin dev
```
