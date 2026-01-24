---
description: 
---

---
name: /landing-structured-data-and-indexing
description: Adds structured data (JSON-LD), canonical rules, index/noindex strategy, optional hreflang scaffolding, and validates everything for SEO. Focus is landing pages only.
---

# /landing-structured-data-and-indexing (DineIn Marketing Site)

## 0) Scope lock (non-negotiable)
This workflow implements:
- structured data JSON-LD for key pages
- canonical tags and consistent URL policy
- index/noindex rules per route
- validation checklist and automated tests where feasible

It must NOT:
- add new pages beyond the IA
- add maps/location/payment APIs/scanner/delivery
- add chat UI
- misrepresent features (no “payment verified”, no delivery)

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Structured data + indexing"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Structured data types (required)
Implement JSON-LD generators in:
- apps/landing/src/seo/structuredData.ts

### 2.1 Organization (site-wide)
Include:
- name
- url
- logo (optional; can be placeholder if no logo yet)
- sameAs (social links if available)

### 2.2 WebSite (site-wide)
Include:
- name
- url
- potentialAction (SearchAction) ONLY if site search exists; otherwise omit

### 2.3 WebPage (per page)
Include:
- name
- url
- description

### 2.4 FAQPage (for pages with FAQ)
Use /docs/landing/faq.md as the content source.
Rules:
- keep answers short
- avoid claims of payment verification
- avoid “AI” references

Optional:
- LocalBusiness for venue profile pages only if you have accurate fields and are ready for compliance.
Default: do NOT add LocalBusiness in v1 to avoid misinformation.

---

## 3) Canonical URL policy (must be explicit)
Create `/docs/landing/canonical-policy.md`:
- canonical for each route is itself (no tracking params)
- ensure trailing slash policy consistent
- for /venue/[slug] (if exists):
  - canonical must be that SEO page, not /v/{slug}
- deep link /v/{slug} is app entry and should not be indexed as a marketing page (depending on implementation)

Implement canonical tags per route.

---

## 4) Index/noindex strategy (required)
Create `/docs/landing/indexing-policy.md`:
- index:
  - /, /rwanda, /malta, /claim
- index optional:
  - /venues (only if content is meaningful and not thin)
  - /venue/[slug] (only if each has unique, useful content)
- noindex:
  - any internal test pages
  - staging routes
  - any pages that are duplicative or thin

Implement robots directives per page accordingly.

---

## 5) hreflang scaffolding (optional, future-ready)
If you expect en + fr + kin later:
- implement a small hreflang utility with placeholders
- do not claim alternate languages unless pages exist

---

## 6) Validation tooling (must run)
Add a validation checklist doc:
- `/docs/landing/seo-validation.md`

Include:
- structured data validation steps (manual + automated)
- canonical validation
- robots/sitemap check
- “view source” check for JSON-LD presence
- headings check (single H1)

If feasible, add a CI step to:
- assert JSON-LD renders on key pages
- assert canonical present
- assert robots and sitemap are accessible

---

## 7) Acceptance criteria (measurable)
- Organization and WebSite JSON-LD renders on all landing pages
- FAQPage JSON-LD renders where FAQ is shown
- Canonical is correct on every route
- Index/noindex rules align with policy doc
- Validation checklist completed
- No structured data claims features you don’t have

---

## 8) Verification evidence
Provide:
- files changed (paths)
- examples of rendered JSON-LD (brief)
- route-by-route canonical and robots directives summary
- tests run (commands + results)
- /scope-guard pass/fail

---

## 9) Output format (mandatory)
At end, output:
- Files changed (paths)
- Structured data types implemented
- Indexing decisions summary
- Tests run
- /scope-guard pass/fail
- Next workflow recommendation: /landing-conversion-widgets-and-pwa-install
