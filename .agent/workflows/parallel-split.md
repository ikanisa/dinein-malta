---
description: Multi-agent orchestration template
---

bash -lc 'set -euo pipefail
DIR="$HOME/.gemini/antigravity/global_workflows"
mkdir -p "$DIR"

# Helper: write file
w(){ f="$1"; shift; cat > "$DIR/$f" <<EOF
$*
EOF
}

# =========================
# 1) INTEGRATOR / MANAGER
# =========================
w agent-integrator.md "---
description: Agent brief — Integrator/Manager for /parallel-split (merge order, gates, final walkthrough)
---
# ROLE: INTEGRATOR (Single Source of Truth)

## Mission
Coordinate parallel agents to ship a world-class fullstack PWA safely: consistent UX, enforced RBAC, no endless loading, deploy-ready, verified.

## Non-negotiables
- Small diffs; phased; no drive-by refactors.
- RBAC enforced in UI + Server/Edge + DB/RLS (if used). Never UI-only.
- Every screen: loading + empty + error + retry (no blank screens).
- Client apps: mobile-first, thumb-friendly, touch targets >=44px, smooth.
- DONE requires: Plan + Task List + Walkthrough (verify + risks + rollback).

## Inputs (collect fast; otherwise assume + state assumptions)
- App type: Portal (Staff/Admin) or Client mobile-first or Both
- App path(s) in monorepo
- URLs: local/preview/prod
- Role matrix: Staff vs Admin capabilities
- Supabase usage? (schema/RLS/Edge) + deploy target (Cloudflare Pages)

## Outputs (Integrator must produce)
1) Consolidated Plan (ordered, low-risk)
2) Task board: who does what + merge order
3) Conflict-avoidance: shared contracts/types first
4) Final Walkthrough: verify steps + evidence + risks + rollback

## Agent roster (choose)
Always: UI System, Frontend, Backend/Edge, QA/Browser, Deploy.
If Supabase: DB/RLS.
If Client-facing: Mobile Experience + Performance (mandatory).
If risky: Security.
If shipping polish: Docs/Runbook.

## Merge order (default)
Contracts/Types → DB/RLS → Backend/Edge → UI System → Frontend wiring → Perf/Sec → QA → Deploy.

## Gates (must run before DONE)
- lint, typecheck, tests (if exist), build
- Browser smoke: Staff flow + Admin flow
- RBAC attack sim: Staff tries admin URL + admin action via API replay → must fail
- Deep-link refresh works
- Client apps: mobile viewports + slow network sanity

## Rollback readiness
- Code: revert/rollback deploy
- DB: rollback migration or mitigation steps
- PWA/SW: avoid stale bundle traps; update strategy documented
"

# =========================
# 2) UI SYSTEM / DESIGN
# =========================
w agent-ui-system.md "---
description: Agent brief — UI System (tokens + components) for world-class PWA portals & mobile apps
---

# ROLE: UI SYSTEM

## Mission
Deliver a consistent minimalist UI system (Soft Liquid Glass when appropriate) that is readable, accessible, and fast.

## Non-negotiables
- Tokens first (spacing/type/radius/blur/shadow/color/motion).
- Glass never reduces readability (contrast first; fewer layers).
- Components include loading/disabled/error states.
- Motion uses transform/opacity; respects prefers-reduced-motion.

## Deliverables
1) Token spec + where stored
2) Component set or consolidation plan:
   - Button/IconButton, Input/Select/Textarea, Card/Badge
   - Modal + Drawer/Sheet, Toast/Alert/InlineError
   - Skeleton (preferred) + Spinner (small)
   - Tabs/Menu/Tooltip
   - Table primitives (portal) or List primitives (client)
3) Usage rules: portal density vs client comfort
4) Evidence: screenshots showing consistency

## DoD checks
- Focus visible + keyboard usable
- Tap targets padded (>=44px)
- Dark mode (if present) readable
- Skeleton → content has no jarring shift
"

# =========================
# 3) FRONTEND WIRING
# =========================
w agent-frontend-wiring.md "---
description: Agent brief — Frontend wiring (routing/state/data/errors/RBAC) for fullstack PWA
---

# ROLE: FRONTEND WIRING

## Mission
Implement robust UX flows: routing, auth boot, data fetching, UI states, error boundaries, and Staff/Admin route guards aligned with backend + RLS.

## Non-negotiables
- No infinite loading: every async has timeout/error + retry.
- Every screen has loading/empty/error/success states.
- RBAC: guard routes + hide forbidden controls (still enforced server-side).
- One consistent data-fetching pattern (don’t mix chaos).

## Deliverables
1) Route map + guards (Staff/Admin)
2) Data layer standard: caching, retries, error format surfaced
3) Error boundaries: app-level + route containment
4) Fix/wire scoped pages (remove mocks in scope)
5) Evidence: recordings + console/network sanity notes

## Verification
- Staff login → staff core flow
- Admin login → admin-only action
- Staff direct URL to admin route blocked
- Deep-link refresh works
- Mobile viewport sanity (no horizontal scroll; input/keyboard OK)
"

# =========================
# 4) BACKEND / EDGE
# =========================
w agent-backend-edge.md "---
description: Agent brief — Backend/API/Edge (authz, validation, contracts, logs) for fullstack PWA
---

# ROLE: BACKEND / EDGE

## Mission
Deliver correct server behavior with strict authorization, validation, consistent errors, and logs/auditability.

## Non-negotiables
- Authorization on server/edge (never trust client).
- Validate inputs; return consistent error shape.
- Idempotency for critical ops where relevant.
- Log privileged actions; avoid silent failures.

## Deliverables
1) Contract(s): request/response + error format
2) Implement/fix endpoints/Edge Functions
3) Authz notes: Staff vs Admin (and tenant scoping if any)
4) Observability: logs + key audit events (if feasible)
5) Verification steps (curl or app flow + expected results)

## Verification
- Staff cannot call admin ops (403)
- Failure cases are user-actionable
- DB mutations match expectations
"

# =========================
# 5) DB / SUPABASE / RLS
# =========================
w agent-db-rls.md "---
description: Agent brief — Supabase DB/RLS (schema, migrations, policies, seeds) aligned with Staff/Admin
---

# ROLE: DB / RLS (Supabase)

## Mission
Keep the database clean and safe: schema integrity, least-privilege RLS, migration safety, and idempotent seeds for demos/UAT.

## Non-negotiables
- Migrations have rollback or mitigation.
- RLS matches role matrix (no overly-broad policies).
- Avoid duplicates; extend existing schema where possible.
- RLS denials must not masquerade as “endless loading” (surface errors).

## Deliverables
1) Migration list + rollback/mitigation notes
2) RLS matrix: role × table × operation
3) Verification queries/checklist
4) Seed plan (idempotent) if needed
5) Index notes for hot queries

## Verification
- Staff sees only allowed rows/actions
- Admin has intended elevation
- No surprise denies in core flows
"

# =========================
# 6) QA / BROWSER
# =========================
w agent-qa-browser.md "---
description: Agent brief — QA/Browser testing (fullstack smoke, evidence, regressions, RBAC attack sim)
---

# ROLE: QA / BROWSER

## Mission
Prove the system works end-to-end. Capture evidence, file issues with repro + root cause guess, verify fixes, and protect against regressions.

## Non-negotiables
- Evidence-driven: screenshot/recording + console + network proof.
- Track each issue: repro → cause → fix → verified.
- RBAC attack simulation is mandatory.

## Deliverables
1) Smoke plan (short): Staff flow, Admin flow, RBAC negatives, deep-link refresh, mobile sanity
2) Issue log (table): severity, repro, evidence, suspected cause, owner
3) Verified fixes with before/after evidence
4) Regression protection: e2e smoke OR deterministic manual checklist

## Verification (minimum)
- Staff core flow works
- Admin core action works
- Staff blocked on admin URL and admin API replay
- Deep-link refresh works
- Mobile viewport sanity
"

# =========================
# 7) CLOUDFLARE DEPLOY
# =========================
w agent-cloudflare-deploy.md "---
description: Agent brief — Cloudflare Pages deploy (monorepo settings, env, SPA routing, caching, rollback)
---

# ROLE: CLOUDFLARE DEPLOY

## Mission
Make deployments boring: correct monorepo settings, safe env discipline, SPA routing works, caching avoids stale JS, rollback ready.

## Non-negotiables
- Preview vs Prod env separation; no secrets in client bundle.
- Deep links refresh correctly.
- Caching strategy prevents stale bundles (entry/SW revalidate).
- Rollback steps explicit.

## Deliverables
1) Pages settings: root dir, build cmd, output dir, prod branch
2) Env var matrix (names only) preview vs prod
3) SPA routing rule(s) + redirects if needed
4) Headers/caching guidance (hashed assets long-cache; entry/SW revalidate)
5) Release ritual + rollback procedure

## Verification
- Preview build succeeds
- Deep-link refresh works
- New deploy loads (no stale JS)
- Identify last-good deploy for rollback
"

# =========================
# 8) MOBILE EXPERIENCE (CLIENT APPS)
# =========================
w agent-mobile-experience.md "---
description: Agent brief — Mobile Experience for client PWAs (Discovery/DineIn): thumb-first, native-like UX
---

# ROLE: MOBILE EXPERIENCE (Client-facing)

## Mission
Maximize native-like mobile UX: thumb-friendly nav, touch ergonomics, sheets/drawers, smooth motion, resilient loading behavior.

## Non-negotiables
- Mobile-first at 360×800 baseline.
- Tap targets >=44px; spacing >=8px.
- Prefer bottom nav for primary sections (when appropriate).
- Keyboard/input behavior must not break forms.
- Skeletons > spinners; no dead ends on weak networks.

## Deliverables
1) Mobile nav spec (tabs/sheets/back behavior)
2) Interaction rules (sheet swipe-to-close, feedback micro-interactions)
3) Motion rules (reduced-motion supported)
4) Evidence: mobile recordings for core journey

## Verification
- One-handed core journey works
- No horizontal scroll; no clipped content
- Slow network sanity: usable, errors surfaced, retry works
"

# =========================
# 9) PERFORMANCE
# =========================
w agent-performance.md "---
description: Agent brief — Performance (budgets, bundle, core web vitals direction, perceived speed)
---

# ROLE: PERFORMANCE

## Mission
Improve perceived speed + performance direction: smaller boot payload, fewer main-thread stalls, faster routes, smooth scrolling.

## Non-negotiables
- Fix biggest bottlenecks first (boot path + heavy deps).
- Route-level splitting for non-trivial apps.
- Virtualize long lists; avoid jank.
- Skeletons and optimistic UI where safe.

## Deliverables
1) Budget targets (JS/CSS/requests) appropriate to app type
2) Top offenders list (largest chunks/deps)
3) Fixes: splitting/prefetch (safe), image/font strategy notes
4) Verification: before/after Lighthouse/DevTools notes + slow network sanity

## Verification
- Boot feels faster; interactions responsive
- Scroll smooth on long lists/tables
- Reduced layout shift where possible
"

# =========================
# 10) SECURITY
# =========================
w agent-security.md "---
description: Agent brief — Security (RBAC hardening, secret hygiene, safe storage, practical OWASP checks)
---

# ROLE: SECURITY

## Mission
Prevent practical failures: RBAC bypass, secret leakage, unsafe token storage, injection surfaces, misconfig.

## Non-negotiables
- Staff cannot access Admin via URL or API replay.
- No secrets in client env/bundle/logs.
- Validate inputs; avoid unsafe HTML rendering.
- Least privilege (server + DB/RLS).

## Deliverables
1) Risk checklist + findings (prioritized P0/P1/P2)
2) Concrete fixes (not theory)
3) CSP direction only if it won’t break required resources
4) Verification steps for each fix

## Verification
- RBAC attack sim fails as expected
- Secret scan: ensure only public keys are shipped
"

# =========================
# 11) DOCS / RUNBOOK
# =========================
w agent-docs-runbook.md "---
description: Agent brief — Docs/Runbook (README, onboarding, ops checks, troubleshooting)
---

# ROLE: DOCS / RUNBOOK

## Mission
Make the repo operable: clear README, onboarding commands, env var names, deployment steps, rollback, and common failure runbook.

## Non-negotiables
- Command-oriented; copy/pasteable.
- Don’t invent scripts; document reality