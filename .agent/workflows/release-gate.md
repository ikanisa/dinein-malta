---
description: 
---

---
name: /release-gate
description: Standard release workflow for all three PWAs (customer/venue/admin): CI gates, env var matrix (RW/MT), build verification, smoke tests, deployment checklist, and rollback plan.
---

# /release-gate (DineIn)

## 0) Scope (hard-locked)
This workflow prepares a safe release. It MUST NOT add product features.
It MUST enforce:
- dine-in constraints (no maps/location, no payment APIs, no scanner UI)
- statuses only: Placed/Received/Served/Cancelled
- deep link entry /v/{slug} works in installed and non-installed contexts

---

## 1) Preconditions
- apps/customer, apps/venue, apps/admin build locally
- Supabase schema + RLS applied (or clearly mocked for staging)
- Workflows 05–09 completed or explicitly deferred with documented risks

If preconditions fail: STOP and produce a remediation plan.

---

## 2) Kickoff (mandatory)
Run: /kickoff with scope: "Release gate"
Output must include:
- Scope lock
- Plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 3) Versioning + Branching rules (boring on purpose)
- Release branch: release/{YYYYMMDD}-{tag}
- All changes must be merged via PR with:
  - checks passing
  - /scope-guard pass
  - lighthouse gates recorded (customer app at minimum)

Commit format:
- feat(customer|venue|admin|core|db|ui): ...
- fix(...)
- chore(...)

---

## 4) Environment variable matrix (must be documented)
Create /docs/env-matrix.md with:
- variable name
- which app(s) need it
- required/optional
- example placeholder value (no secrets)
- fallback behavior if missing

### 4.1 Minimum env vars (typical)
- NEXT_PUBLIC_SUPABASE_URL (all apps)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (all apps)
- SUPABASE_SERVICE_ROLE_KEY (server-side only; never exposed to client)
- GEMINI_API_KEY (server-side OCR worker only; never exposed to client)
- APP_BASE_URL (customer/venue/admin if needed for QR generation)
- APP_ENV (local|staging|prod)

Rules:
- NEVER print real secret values
- Any new env var must include reason + safe default behavior

---

## 5) CI Gate Checklist (must pass)
### 5.1 Required checks
- Typecheck: ts/strict
- Lint
- Unit tests
- Integration tests (db helpers / RLS validation scripts if present)
- Build for each app:
  - customer
  - venue
  - admin

### 5.2 Optional but recommended
- E2E smoke suite (Playwright)
- Lighthouse CI for customer app

If any check fails: STOP and fix before proceeding.

---

## 6) Deployment Checklist (step-by-step)
Deploy in this order to reduce blast radius:

### 6.1 Staging deploy
1) Deploy Supabase migrations to staging
2) Seed staging data (non-sensitive)
3) Deploy customer PWA
4) Deploy venue PWA
5) Deploy admin PWA

### 6.2 Staging smoke tests (must pass)
Customer:
- Open /v/{slug} (staging)
- Add item -> cart -> checkout -> place order
- Confirm order status page loads

Venue:
- Login as demo owner
- View orders queue
- Mark order Received -> Served
- Verify customer sees updated status

Admin:
- Login as admin demo
- Approve a pending claim
- Verify venue ownership updates

PWA:
- Install prompt behaves (no first-paint)
- Offline browse works after one visit (menu caching)
- No permission prompts (camera/location)

Record evidence:
- screenshots or short screen recordings for each app

### 6.3 Production deploy
Repeat staging order:
1) DB migrations (prod)
2) Customer PWA
3) Venue PWA
4) Admin PWA
5) Post-deploy smoke tests (smaller set)

---

## 7) Rollback plan (must exist before prod)
### 7.1 App rollback
- Keep previous deployment artifact available
- Roll back to previous version if:
  - deep link /v/{slug} breaks
  - ordering flow breaks
  - venue cannot update statuses
  - admin cannot approve claims

### 7.2 Database rollback
Prefer forward-fix migrations.
Only use down migrations if:
- explicitly tested
- reversible without data loss

Document:
- which migrations are safe to revert
- how to hotfix forward

---

## 8) Release notes (required)
Create /docs/release-notes/{version}.md with:
- what shipped
- what changed by app (customer/venue/admin)
- known limitations
- risk areas
- next planned slice

---

## 9) Final gate: /scope-guard + tap budget audit
Before release finalization:
- Run /scope-guard and report pass/fail
- Confirm tap budget ≤ 4 from menu screen
- Confirm no scanner UI exists anywhere
- Confirm no map/location libs present in dependencies

If any violation exists: STOP release.

---

## 10) Output format (mandatory)
At end, output:
- release branch name
- checks run (commands + results)
- env-matrix doc path
- staging smoke test evidence list
- prod smoke test plan
- rollback plan summary
- /scope-guard pass/fail
