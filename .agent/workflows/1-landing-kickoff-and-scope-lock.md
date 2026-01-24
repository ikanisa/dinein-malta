---
description: 
---

---
name: /landing-kickoff-and-scope-lock
description: Establishes the landing page’s scope, success metrics, SEO targets, and hard constraints (no maps, no payment APIs). Produces the implementation plan + task list + acceptance gates.
---

# /landing-kickoff-and-scope-lock (DineIn Marketing Site)

## 0) Hard scope (non-negotiable)
We are building a marketing landing page + SEO-friendly marketing pages.

Must NOT include:
- maps, geolocation, location-based venue sorting
- payment API integrations or payment verification
- in-app QR scanning UI
- delivery concepts

Allowed:
- links into the PWA entry routes (e.g., /v/{slug})
- SEO-friendly “directory preview” pages (country-based) if needed
- rich widgets and motion, but performance-safe

Brand/UI requirements:
- modern mobile-first
- liquid-glass feel + soft gradients
- rich widgets
- minimal copy, high clarity, no clutter
- accessibility-safe (glass blur cannot reduce readability)

SEO goals:
- crisp semantics, structured data, fast on mobile
- pass Core interaction/performance gates (INP-first mindset)

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Landing page fullstack implementation"
Output must include:
- scope lock + explicit exclusions
- target audience (RW + MT)
- success metrics
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Deliverables (must be produced in this workflow)
Create:
1) /docs/landing/brief.md
2) /docs/landing/sitemap.md
3) /docs/landing/seo-targets.md
4) /docs/landing/design-targets.md
5) /docs/landing/tasks.md

### 2.1 brief.md must include
- one-paragraph positioning
- primary CTA (Install / Open App)
- secondary CTA (Discover venues / Claim venue)
- what pages exist and why
- what content is dynamic vs static

### 2.2 sitemap.md must include
Minimum recommended routes:
- /
- /rwanda
- /malta
- /venues (optional directory)
- /venue/{slug} (optional SEO profile page; NOT the in-app menu)
- /claim (venue onboarding marketing page)
- /privacy, /terms

Deep link rules:
- /v/{slug} remains the app entry to the menu; landing pages may link to it.

### 2.3 seo-targets.md must include
- keyword themes (not stuffed)
- internal linking plan
- metadata rules
- structured data plan (Org/WebSite/FAQ)
- index policy for each route
- canonical rules
- hreflang plan (if multi-language added later)

### 2.4 design-targets.md must include
- token palette (2 themes)
- liquid glass constraints:
  - blur usage limited
  - contrast requirements
  - fallback for browsers without backdrop-filter
- widget list for landing (no images required):
  - hero “Install/Open” dock
  - country switch pill
  - venue discovery preview cards (text-only)
  - trust chips (fast, dine-in only, no delivery)
  - FAQ accordion
  - CTA rail (sticky)

### 2.5 tasks.md must include
- phased implementation tasks (foundation -> UI -> SEO -> perf -> deploy)
- test plan and acceptance gates

---

## 3) Acceptance gates (must define upfront)
Performance gates (mobile):
- INP target threshold
- LCP target threshold
- CLS target threshold

SEO gates:
- valid titles/descriptions per route
- sitemap + robots present
- structured data validates
- canonical correct
- no-index for non-SEO pages if needed

Quality gates:
- accessibility baseline (keyboard nav, contrast)
- no broken links
- no heavy images required for above-the-fold

---

## 4) Output format (mandatory)
At end, output:
- files created (paths)
- summary of scope + sitemap
- acceptance gates list
- next workflow recommendation: /landing-ia-copy-and-seo-brief
