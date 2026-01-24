---
description: 
---

---
name: /landing-performance-core-signals
description: Hardens the landing site for maximum real-world performance: minimize JS/hydration, optimize fonts, enforce INP/LCP/CLS gates, add caching headers, and prevent glass effects from hurting performance.
---

# /landing-performance-core-signals (DineIn Marketing Site)

## 0) Scope lock (non-negotiable)
This workflow improves:
- performance and Core Web Vitals readiness
- bundle size and hydration strategy
- caching and asset optimization

It must NOT:
- change content strategy or add new product features
- add maps/location/payment APIs/scanner/delivery
- introduce heavy animation libraries without justification

Must preserve:
- liquid-glass design while keeping readability and speed

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Landing performance + Core signals"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Performance targets (define as gates)
Create `/docs/landing/perf-targets.md` with:
- INP target (mobile)
- LCP target (mobile)
- CLS target
- TTFB target
- JS bundle budget (per route)
- max CSS budget

These become CI or manual release gates.

---

## 3) Hydration minimization (largest win)
Rules:
- Default to server components / SSR/SSG with minimal client JS
- Only hydrate interactive widgets:
  - country switch
  - FAQ accordion
  - install dock
- All else: static HTML + CSS

Implement:
- a clear boundary: `components/static/*` vs `components/interactive/*`
- ensure interactive widgets are tiny and code-split

---

## 4) Bundle & dependency discipline
- remove unused deps
- avoid large UI libs for landing
- no icon packs that ship huge bundles; use a minimal set or tree-shaken icons
- ensure code splitting by route
- avoid client-side analytics heavy scripts; keep minimal

Add:
- bundle analyzer (optional) to enforce budgets

---

## 5) Fonts & text rendering
Implement:
- system font stack OR a single optimized web font with:
  - `display=swap`
  - preconnect/preload as needed
- avoid multiple font weights
- ensure headings are readable and stable (avoid CLS)

---

## 6) Images policy (since you want “no images”)
- keep hero and widgets text-first
- allow tiny vector shapes via CSS
- if any images exist later:
  - must be optimized, lazy-loaded below the fold
  - use responsive sizes
- above-the-fold: no large images required

---

## 7) Glass performance rules (important)
Enforce in tokens/components:
- backdrop-filter used sparingly
- avoid animating blur
- avoid stacking multiple glass layers
- ensure a “solid fallback” class
- reduce expensive shadows on large elements

---

## 8) Caching & headers
Implement caching:
- immutable caching for static assets
- reasonable caching for sitemap/robots
- if ISR used: define revalidate times

Add:
- compression and caching configuration appropriate to deployment target

---

## 9) Prefetching strategy
- prefetch key internal routes (country pages, claim page) only when idle
- avoid aggressive prefetch on slow networks

---

## 10) Measurements & audits (must run)
Run and document:
- Lighthouse performance (mobile emulation)
- Lighthouse SEO + A11y quick check
- record bundle size (route-level if possible)

Create `/docs/landing/perf-report.md`:
- before/after metrics
- what changed

---

## 11) Testing & verification
- build passes
- pages render and remain usable without JS
- interactive widgets function
- no layout shift when fonts load (CLS controlled)
- perf targets are met or improvements shown

---

## 12) Acceptance criteria (measurable)
- perf targets documented and met (or explicit deltas shown)
- landing pages ship minimal JS; interactive widgets are code-split
- CLS is controlled (no major layout jumps)
- glass effects do not tank performance
- caching headers configured
- /scope-guard passes

---

## 13) Verification evidence
Provide:
- files changed (paths)
- Lighthouse scores + key metrics
- JS bundle sizes (or analyzer summary)
- perf report doc
- /scope-guard pass/fail

---

## 14) Output format (mandatory)
At end, output:
- Files changed (paths)
- Perf targets summary
- Metrics summary (before/after)
- Tests run
- /scope-guard pass/fail
- Next workflow recommendation: /landing-structured-data-and-indexing
