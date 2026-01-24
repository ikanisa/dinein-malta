---
description: 
---

Use workflow: /.agent/workflows/readme_for_real.md

Task: Create a robust, comprehensive root README.md for the DineIn monorepo, plus any required /docs files it links to (env-matrix, architecture, pwa, testing). Do not invent scripts—use package.json scripts that exist.

Process:
- First run /kickoff and stop at the execution gate.
- Then implement README.md and docs.
- Verify all relative links work.
- Run /scope-guard and report pass/fail.

Hard constraints: dine-in only, no delivery, no maps/location, no payment APIs/verification, no scanner UI; statuses only Placed/Received/Served/Cancelled; customer nav 2 tabs; /v/{slug} deep link sets activeCountry from venue; RW MoMo USSD handoff, MT Revolut link handoff.
---
name: /readme-for-real
description: Produces a world-class README for the DineIn monorepo (customer/venue/admin PWAs + shared packages + Supabase). Includes setup, architecture, workflows, env matrix, troubleshooting, and contributor rules—without lying or drifting from scope.
---

# /readme-for-real

## 0) Scope lock (must be stated in README)
DineIn is:
- Dine-in only (no delivery)
- No maps/location integration
- No payment API integrations or payment verification
- No in-app QR scanner UI
- Order statuses: Placed, Received, Served, Cancelled
- Customer app has 2 tabs: Home and Settings
- Entry deep link: /v/{venueSlug} opens venue menu directly and sets activeCountry from venue

Countries:
- Rwanda: MoMo USSD code handoff (no API)
- Malta: Revolut link handoff (no API)

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "README creation"
Output must include:
- Plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) README structure (required sections)
Create/Update:
- README.md (root)
- /docs/README.md (optional: deeper docs index)

Root README must include:

### 2.1 Project summary
- What it is (dine-in PWA suite)
- What it is NOT (explicit exclusions)
- High-level user journeys (customer, venue, admin)

### 2.2 Monorepo layout
- apps/customer
- apps/venue
- apps/admin
- packages/ui
- packages/core
- packages/db
- supabase/ (migrations, policies, functions)

### 2.3 Tech stack
- Frontend framework(s)
- UI system approach (tokens + widgets)
- Backend: Supabase (DB + Auth + Storage + RLS + Edge Functions)
- OCR: Gemini server-side worker (if enabled)
- Testing: unit + Playwright E2E
- PWA: service worker + manifests

### 2.4 Quick start (local dev)
Step-by-step with commands:
1) Install deps
2) Setup env vars (point to docs/env-matrix)
3) Start Supabase locally (if used)
4) Run apps (customer/venue/admin)
5) Run tests
6) Build for production

Rules:
- Keep commands copy/pasteable.
- Mention supported Node/pnpm versions.

### 2.5 Environment variables
- Link to /docs/env-matrix.md (or include short table)
- Separate client-safe vs server-only
- Warnings: never commit secrets

### 2.6 Database & RLS
- How migrations work
- How to apply locally/staging/prod
- RLS principles and where to test

### 2.7 Core routes & deep links
- /v/{slug} behavior
- Customer nav routes
- Venue/admin gating routes

### 2.8 Country mode behavior
- How RW/MT is derived
- Payment handoff differences
- Currency display rules

### 2.9 OCR pipeline (if present)
- Upload -> job -> staging -> review -> publish
- Never auto-publish raw OCR

### 2.10 Development workflows (Antigravity)
Include a section “How we work” with:
- /kickoff
- /scope-guard
- /pwa-quality-slice
- /release-gate
- /fullstack-refactor
- /final-screen-coverage-qa

Each workflow: 1 sentence what it protects.

### 2.11 Testing
- Unit tests
- E2E tests (3 critical journeys)
- How to run locally and in CI
- Where artifacts live (traces/screenshots)

### 2.12 Deployment
- Staging vs production
- Build commands
- PWA installability notes
- Rollback summary

### 2.13 Troubleshooting
Common issues:
- Supabase keys
- RLS denies
- service worker caching surprises
- build failures
- “stuck loading” debugging steps

### 2.14 Contribution rules
- Code style
- Commit conventions
- PR checklist (tests + screenshots + scope-guard)
- Security rules (no secrets, RLS changes require tests)

### 2.15 License + contact
- License
- Maintainers / how to get help

---

## 3) Docs that README must link to (required)
Create/update these if missing:
- /docs/env-matrix.md
- /docs/architecture.md
- /docs/pwa.md
- /docs/testing.md (or /docs/testing/e2e.md)
- /docs/go-live/ (if used)

README should stay concise; detailed docs live under /docs.

---

## 4) Visuals (optional, but powerful)
Allowed:
- Mermaid diagrams (architecture + flows)
Not allowed:
- big screenshots dump in README

Include at least:
- Mermaid monorepo architecture diagram
- Mermaid customer order flow diagram (≤4 taps)
- Mermaid OCR pipeline diagram (if present)

---

## 5) Verification (must be done)
- Links in README must resolve (no broken paths)
- Commands must match repo scripts (no imaginary commands)
- README must not claim features we don’t have
- Scope lock section must be explicit
- Run /scope-guard and report pass/fail

---

## 6) Acceptance criteria (measurable)
- New developer can run customer app locally in <15 minutes following README
- README accurately reflects dine-in constraints
- README includes: architecture, env, DB/RLS, workflows, testing, deployment, troubleshooting
- No stale or invented commands/paths
- /scope-guard passes

---

## 7) Output format (mandatory)
At end, output:
- Files created/changed (paths)
- README section checklist (all covered)
- Any assumptions made (must be minimal)
- /scope-guard pass/fail
