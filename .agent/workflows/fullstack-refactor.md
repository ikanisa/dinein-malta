---
description: 
---

---
name: /fullstack-refactor
description: End-to-end refactoring workflow for a full-stack monorepo (customer/venue/admin + shared packages + DB/Edge). Prioritizes safety, small slices, measurable wins, and zero scope creep.
---

# /fullstack-refactor

## 0) Scope lock (non-negotiable)
This workflow refactors existing code. It must NOT introduce new product features.

Hard constraints for DineIn:
- Dine-in only (no delivery).
- No maps/geolocation/location sorting.
- No payment API integrations or payment verification logic.
- No in-app QR scanner UI.
- Order statuses only: Placed, Received, Served, Cancelled.
- Customer bottom nav stays exactly 2 tabs (Home, Settings).
- Deep link /v/{slug} must keep working.

If any refactor would break constraints, STOP and propose a safer alternative.

---

## 1) Refactor principles (so you don’t destroy the app)
### 1.1 “Change one axis at a time”
Only ONE of these per slice:
- Structure (folders/modules)
- Behavior (logic)
- Performance (queries/caching)
- UI consistency (tokens/components)

### 1.2 No “big bang” rewrites
Refactor in **vertical slices** (one journey at a time), each with:
- tests
- screenshots
- measurable improvement
- rollback plan

### 1.3 Keep the app runnable at every commit
Every commit must:
- build
- typecheck
- run minimal tests
- keep key routes reachable

---

## 2) Kickoff (mandatory)
Run: /kickoff with scope: "Fullstack refactor workflow execution"

Output must include:
- Scope lock + explicit exclusions
- Current symptoms (duplication, loading issues, file sprawl, slow queries)
- Refactor goals (measurable)
- Plan + task list + acceptance criteria + verification plan
Stop at the execution gate unless XS.

---

## 3) Refactor roadmap (phases)
### Phase A — Baseline & inventory (no code changes yet)
Deliverables:
- Architecture map (apps + packages + db/functions)
- Dependency map (what imports what)
- “Hot paths” list (top 3 journeys)
- Tech debt list (top 20 issues) with severity/effort
- Build/test baseline metrics (time, bundle size, Lighthouse score)

### Phase B — Structural cleanup (safe re-org)
Deliverables:
- Consistent module boundaries
- No duplicate utility files
- Single UI system usage
- Shared types centralized (DB + contracts)
- Remove dead code and unused dependencies

### Phase C — Data layer refactor (RLS-safe)
Deliverables:
- Query contract in packages/db
- No “select *”
- Pagination in lists
- RPC/transactions where needed (orders create, publish menu)
- Index + RLS performance fixes

### Phase D — UI refactor (consistency + states)
Deliverables:
- All screens use packages/ui templates
- Loading/empty/error states everywhere
- Strict tokens (no raw hex)
- Tap budget preserved

### Phase E — Hardening (tests + release gates)
Deliverables:
- Playwright E2E for 3 critical journeys
- Lighthouse gates (customer app)
- CI pipeline stable
- Go-live checklist updated

---

## 4) Inventory step (must be done first)
Create `/docs/refactor/inventory.md` including:

### 4.1 Apps
- apps/customer
- apps/venue
- apps/admin

For each:
- entry routes
- core state stores
- data fetching patterns
- biggest pain points

### 4.2 Packages
- packages/ui (components/tokens)
- packages/core (domain logic, telemetry, i18n, guards)
- packages/db (queries/types/contracts)
- packages/agents or workers (OCR/Edge functions) if present

### 4.3 Backend
- supabase migrations
- RLS policies
- Edge functions / server actions
- storage buckets

---

## 5) “Refactor contract” (every slice must follow)
Each refactor slice must output:

1) Scope lock (what is NOT changing)
2) Target area (files/routes)
3) Baseline (before metrics, screenshots)
4) Plan (steps)
5) Implementation (small commits)
6) Verification (tests + evidence)
7) Measurable result (bundle down, fewer files, faster load)
8) Rollback plan

If any of these is missing, the slice is rejected.

---

## 6) Safe slicing strategy (recommended slice order)
Execute slices in this order (highest user impact first):

Slice 1 — Customer: /v/{slug} menu + cart + checkout
- unify data fetching
- stabilize state
- ensure ≤4 taps
- add states + test IDs

Slice 2 — Venue: orders queue + bell inbox
- consolidate queries
- reduce rerenders
- stabilize status updates

Slice 3 — Admin: claims approval
- ensure atomic approval + audit logging
- strict role gating

Slice 4 — Shared UI system adoption
- replace ad-hoc components with packages/ui
- enforce tokens + templates

Slice 5 — DB query contract + indexes
- remove select *
- reduce joins
- add missing indexes

Slice 6 — OCR pipeline hardening (if used)
- job queue + retries + staging review + publish transaction

Slice 7 — Final screen coverage QA
- ensure 100% screens exist and are clickable

---

## 7) Codebase restructuring rules (monorepo hygiene)
### 7.1 Folder standard
apps/*:
- src/routes (or pages)
- src/screens
- src/components (thin)
- src/state
- src/data (calls packages/db)
- src/styles (minimal; tokens only)

packages/*:
- core: domain logic, guards, telemetry, i18n
- ui: tokens, primitives, widgets, templates
- db: typed queries, contracts, helpers

### 7.2 Import rules
- apps may import from packages/*
- packages/ui must not import app code
- packages/db must not import UI
- core can be imported by apps and by db, but must stay domain-level

Add lint rules for boundary violations if feasible.

---

## 8) Refactor targets (what to clean up)
### 8.1 Remove duplication
- duplicate types → generate from DB once
- duplicate fetch helpers → packages/db
- duplicate formatting helpers → packages/core
- duplicate UI patterns → packages/ui templates

### 8.2 Kill “spooky action at a distance”
- consolidate global state: one store per app
- no cross-route hidden mutations
- use explicit “actions” layer for writes

### 8.3 Normalize async patterns
Pick ONE:
- server actions (preferred if Next)
- or a client data layer with hooks + query keys
But not 3 different patterns.

### 8.4 Standardize errors
One error boundary pattern:
- ErrorState + Retry
- toast for transient errors
- never show raw error objects to users

---

## 9) DB/RLS refactor guardrails (don’t break security)
When touching schema/policies:
- always add migration + policy changes together
- add negative tests (non-owner cannot write)
- add indexes for any column used in policies
- prefer RPC for multi-step mutations (approve claim, publish menu, create order)

---

## 10) Tooling gates (must be wired before heavy refactor)
Add or verify:
- typecheck
- lint
- unit test runner
- Playwright E2E (at least the 3 critical journeys)
- Lighthouse run for customer app

A refactor slice cannot merge without passing gates.

---

## 11) “What to avoid” (classic refactor failures)
DO NOT:
- rename everything at once
- move files without updating import boundaries
- mix UI redesign + logic rewrite in the same PR
- add new dependencies to “make refactor easier” without justification
- rewrite DB schemas without migration + RLS test coverage
- “optimize” with caching writes or offline ordering (out of scope)

---

## 12) Acceptance criteria (for the whole refactor program)
- Monorepo builds cleanly; CI stable
- Shared packages are the single source of truth
- /v/{slug} journey is fast, stable, ≤4 taps
- Venue orders + bell are stable and responsive
- Admin claim approval is atomic, audited, secure
- No banned features introduced
- Screen coverage matrix is complete
- Lighthouse (customer) meets target gates
- Codebase is smaller: fewer duplicate files and fewer dependencies

---

## 13) Output format (mandatory at end of each slice)
- Files changed (paths)
- Before/after metrics
- Demo steps (routes)
- Tests run (commands + results)
- Screenshots list
- /scope-guard pass/fail
- Next slice recommendation.  Use workflow: /.agent/workflows/fullstack_refactor.md

Start Phase A: Baseline & inventory ONLY (no code changes yet).

Deliverables to create (exact files):
1) /docs/refactor/inventory.md
2) /docs/refactor/tracker.md
3) /docs/refactor/baseline-metrics.md
4) /docs/refactor/top-debt-list.md

Rules:
- Obey DineIn scope lock: no maps/location, no payment APIs/verification, no scanner UI, no delivery, statuses only Placed/Received/Served/Cancelled, customer nav stays 2 tabs, deep link /v/{slug} must work.
- Do not refactor code in this phase.
- The inventory must cover apps/customer, apps/venue, apps/admin, packages/ui, packages/core, packages/db, and supabase (migrations, RLS, edge functions, storage).
- baseline-metrics must record build time, typecheck time, bundle size estimate, and Lighthouse scores (customer app) if available.
- top-debt-list must rank top 20 issues by severity/effort with exact file paths and why each matters.
- tracker must list refactor slices (Slice 1–7) with status and acceptance criteria.

After producing the files, output:
- a short summary of findings
- the recommended Slice 1 scope (customer /v/{slug} -> cart -> checkout), with a 5-step plan
- run /scope-guard and report pass/fail

