---
description: 
---

---
name: /landing-build-nextjs-seo-foundation
description: Implements the landing site as a SEO-first web app (prefer Next.js App Router, or match your stack) with clean routing, semantic pages, metadata, OpenGraph, sitemap/robots, canonical URLs, and an SEO-safe integration into the monorepo.
---

# /landing-build-nextjs_seo_foundation (DineIn Marketing Site)

## 0) Scope lock (non-negotiable)
This workflow implements:
- landing site app inside the monorepo (apps/landing)
- SEO foundations: metadata, OG, sitemap.xml, robots.txt, canonical
- static generation strategy for speed + crawlability
- clean internal linking to the PWA

It must NOT:
- add maps/location/payment APIs/scanner/delivery
- add chat UI
- rely on heavy client-side rendering for critical content

Must:
- render content server-side (SSR/SSG) for SEO
- be mobile-first
- keep performance high (avoid large JS bundles)

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Landing build + SEO foundation"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) App structure in monorepo
Create new app:
- apps/landing

Include:
- shared UI usage from packages/ui-landing (from Workflow 3)
- shared copy/metadata docs from /docs/landing

---

## 3) Routing (required)
Implement routes:
- /
- /rwanda
- /malta
- /claim
- /privacy
- /terms

Optional (only if IA says so):
- /venues (country-filtered directory preview)
- /venue/[slug] (SEO profile page, not the in-app menu)

Hard rule:
- /v/[slug] remains the app deep link for ordering; landing should link to it but not duplicate full menu ordering.

---

## 4) Rendering strategy (SEO-first)
Use SSG for:
- /, /rwanda, /malta, /claim, /privacy, /terms

If /venue/[slug] exists:
- SSG with incremental regeneration (ISR) or scheduled rebuild
- ensure canonical and content correctness

Avoid:
- client-only rendering for main content
- hiding headings behind JS

---

## 5) Metadata system (must implement)
Create:
- apps/landing/src/seo/metadata.ts
- apps/landing/src/seo/openGraph.ts

For each route:
- title
- description
- canonical
- robots directive
- OG tags
- twitter card

Rules:
- 1 H1 per page
- metadata must match /docs/landing/metadata.md
- no keyword stuffing

---

## 6) sitemap.xml and robots.txt (must implement)
Generate sitemap including:
- all public indexable routes
- optionally venue pages if implemented

robots.txt must:
- allow crawling of landing pages
- disallow admin/internal routes if any
- include sitemap url

---

## 7) Structured data (stub now, detailed later)
Add a placeholder layer:
- apps/landing/src/seo/structuredData.ts
Implement:
- Organization
- WebSite
- (FAQPage) stub reading from /docs/landing/faq.md later

Do not overdo in this workflow; just lay the foundation.

---

## 8) Internationalization readiness (RW + MT)
Even if copy is English-only now:
- ensure country pages exist
- ensure canonical URLs are stable
- optionally prepare hreflang scaffolding (no need to ship multiple languages yet)

---

## 9) SEO-safe linking to the PWA
Define helper:
- `openAppUrl(country?, venueSlug?)`
Rules:
- If user is on /venue/[slug] landing page:
  - prominent CTA: “Open menu”
  - links to /v/{slug}
- Avoid confusing indexable pages with app pages (canonical correctly set)

---

## 10) Analytics (optional but recommended)
Add minimal event tracking (privacy safe):
- CTA clicks
- install prompt clicks
- country switch

No invasive tracking.

---

## 11) Testing & verification
- Build passes
- Pages render without JS
- Titles/descriptions present
- sitemap.xml accessible
- robots.txt accessible
- canonical tags correct
- Lighthouse SEO score high (goal ≥ 90)

---

## 12) Acceptance criteria (measurable)
- apps/landing exists and builds
- All required routes exist and render server-side
- metadata/OG/canonical implemented for each route
- sitemap.xml + robots.txt present and correct
- internal links match IA plan
- no banned features introduced

---

## 13) Verification evidence
Provide:
- files created/changed (paths)
- route list
- sample page HTML snippet showing H1 present (brief)
- Lighthouse SEO score (if feasible)
- /scope-guard pass/fail

---

## 14) Output format (mandatory)
At end, output:
- Files changed (paths)
- Routes implemented
- SEO features checklist
- Tests run
- /scope-guard pass/fail
- Next workflow recommendation: /landing-performance-core-signals
