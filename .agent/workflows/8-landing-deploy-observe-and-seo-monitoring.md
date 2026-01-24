---
description: 
---

---
name: /landing-deploy-observe-and-seo-monitoring
description: Production deployment workflow for the DineIn landing site: environment setup, build/deploy steps, SEO verification (sitemap/robots/canonical/structured data), Search Console onboarding, monitoring, and rollback.
---

# /landing-deploy-observe-and-seo-monitoring (DineIn Marketing Site)

## 0) Scope lock (non-negotiable)
This workflow covers:
- deployment steps (staging -> production)
- SEO verification + indexing readiness
- monitoring + rollback plan

It must NOT:
- add product features
- add maps/location/payment APIs/scanner/delivery
- change the landing content strategy beyond small fixes required for correctness

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Landing deploy + SEO monitoring"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Environments (required)
Create `/docs/landing/environments.md`:
- staging domain
- production domain
- env var list for landing app
- build command(s)
- deploy command(s)
- what differs between staging/prod (only values, not names)

Rules:
- no secrets in docs
- keep env names stable across envs

---

## 3) Release checklist (required)
Create `/docs/landing/release-checklist.md` with ordered steps:

### 3.1 Pre-deploy
- lint/typecheck/test
- Lighthouse run (perf/seo/a11y)
- verify no broken links
- verify metadata per route
- verify structured data renders
- verify canonical tags
- verify robots.txt + sitemap.xml

### 3.2 Deploy staging
- deploy staging
- run smoke checks (section 5)

### 3.3 Deploy production
- deploy production
- run smoke checks again
- record release version + timestamp

---

## 4) SEO onboarding checklist (Search Console + sitemap)
Create `/docs/landing/seo-ops.md`:

Include:
- verify domain ownership (method depends on host; document it)
- submit sitemap URL
- check robots.txt reachable
- request indexing for key pages (/, /rwanda, /malta, /claim)
- monitor coverage, pages indexed, and errors weekly

Add a note:
- indexing takes time; do not “fix” by stuffing keywords

---

## 5) Smoke checks (must be executable)
Create `/docs/landing/smoke.md`:

### Page checks
For each route (/, /rwanda, /malta, /claim, /privacy, /terms):
- loads without console errors
- has exactly one H1
- has title + meta description
- has canonical tag
- has JSON-LD (where expected)
- links work (Open app, Claim, country switch)

### SEO asset checks
- /robots.txt loads
- /sitemap.xml loads and contains expected routes

### Mobile checks
- sticky CTA rail visible and not covering content
- no CLS jumps on load
- install help link works

---

## 6) Monitoring (minimal but real)
Create `/docs/landing/monitoring.md`:

Monitor:
- uptime (basic)
- 404 rate
- slow responses / high TTFB
- client errors (optional lightweight logging)
- Lighthouse trend (manual weekly or automated)

Define alert thresholds:
- 404 spike
- p95 latency spike
- deploy error rate spike

---

## 7) Rollback plan (required)
Create `/docs/landing/rollback.md`:

Include:
- how to redeploy previous version
- what triggers rollback:
  - broken homepage
  - broken /robots.txt or /sitemap.xml
  - broken canonical across pages
  - severe performance regression
- post-rollback steps:
  - verify pages
  - log incident summary

---

## 8) Post-launch SEO hygiene (no spam)
Create `/docs/landing/post-launch.md`:

Weekly:
- Search Console: coverage + page experience + indexing status
- top queries and pages (only to guide content clarity)
- check structured data warnings

Monthly:
- add 1–2 FAQ improvements or clarifications
- tighten internal linking
- ensure copy stays aligned with product (no feature drift)

Rules:
- do not add “thin” pages
- do not create auto-generated keyword pages

---

## 9) Acceptance criteria (measurable)
- staging and production deployments documented
- smoke checks exist and are run for staging and prod
- robots.txt and sitemap.xml verified in prod
- canonical and structured data verified in prod
- monitoring and rollback docs exist
- release checklist exists and is followed
- /scope-guard passes

---

## 10) Verification evidence
Provide:
- files created/changed (paths)
- deploy proof (build output summary, if available)
- smoke check results summary
- Lighthouse scores (prod or staging)
- /scope-guard pass/fail

---

## 11) Output format (mandatory)
At end, output:
- Files changed (paths)
- Deploy steps summary
- Smoke results summary
- Monitoring/rollback summary
- /scope-guard pass/fail
