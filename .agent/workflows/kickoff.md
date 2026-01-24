---
description: Kick off any task in our AI-first Staff/Admin monorepo PWAs with a plan, task list, and verification gates
---

bash -lc 'set -euo pipefail
FILE="$HOME/.gemini/antigravity/global_workflows/kickoff.md"
mkdir -p "$(dirname "$FILE")"

cat > "$FILE" <<'"'"'EOF'"'"'
---
description: Global kickoff for all projects — robust, concise execution contract for AI-first monorepo PWAs (Staff/Admin + optional client app)
---

# /kickoff (GLOBAL)

## Goal
Start any task with a strict execution contract: correct scope, correct plan, correct gates, correct next workflows.

---

## 1) Classify the request (pick ONE)
FEATURE | BUGFIX | AUDIT | REFACTOR | GO-LIVE | DEPLOY | PERFORMANCE | SECURITY | UX-POLISH | DOCS

Then immediately propose a workflow chain (don’t execute yet):
- Multi-area work → /parallel-split
- Repo/system audit → /fullstack-audit (or /worldclass-pwa-audit if UX/perf heavy)
- Refactor/repair → /fullstack-refactor-repair (or /refactor-safely for small)
- Go-live decision → /go-live-readiness
- Browser QA → /browser-fullstack-test
- Cloudflare deploy → /cloudflare-pages-setup + /cloudflare-pages-env-vars + /cloudflare-pages-spa-routing + /cloudflare-pages-release
- Standards sync → /apply-standards
- README overhaul → /readme-comprehensive

---

## 2) Execution Contract (must output first)
Write a short contract:
- **Goal (1 sentence)**
- **In-scope (3–7 bullets)**
- **Out-of-scope (bullets)**
- **Repo + app path(s)** (monorepo locations)
- **App type**: Staff/Admin portal OR Client-facing mobile-first OR Both
- **Environments**: local/preview/prod (URLs if known)
- **Constraints**: stack choices, deadlines, “must not change” items

Ask ONLY blocking questions. If not blocked, proceed with explicit assumptions.

---

## 3) Universal Non-Negotiables (apply to all projects)
- Roles: Staff + Admin must exist (extra roles allowed).
- RBAC must be enforced in **UI + server/edge + DB/RLS (if used)**. Never UI-only.
- Every screen/route has **loading + empty + error + retry** (no blank screens).
- No infinite loading: timeouts + error boundaries + surfaced root cause.
- Minimalist modern UI; “Soft Liquid Glass” only when readability stays high.
- Motion must respect prefers-reduced-motion.
- Small diffs, phased changes; no drive-by refactors.
- “Done” requires: **Plan + Task List + Walkthrough (verification + risks + rollback).**

---

## 4) Baseline Snapshot (before changes)
Capture current state (even if quick):
- Build status: lint/typecheck/tests/build (or note missing scripts)
- Runtime status: does app load? any endless spinner? console errors?
- Auth status: login works? redirect loops?
- Data status: key requests succeed? any 401/403/5xx? any RLS denies?
- Deploy status (if relevant): Cloudflare settings + env vars separation

Output: a short “Baseline” block with evidence notes.

---

## 5) Implementation Plan (required artifact)
Produce a plan with only applicable sections:

### A) Architecture touchpoints
- Frontend: routing, app shell, data layer, state, error boundaries
- Backend/Edge: endpoints/functions, authz, validation, error format, logs
- DB/Supabase: schema, migrations, RLS/policies, indexes, seeds
- PWA: manifest, SW/cache strategy, offline + update safety
- Deploy: Cloudflare Pages settings, env discipline, SPA routing, headers/caching, rollback

### B) RBAC enforcement path (must be explicit)
- Role matrix: Staff vs Admin capabilities
- UI: route guards + UI control gating
- Server/Edge: authz checks
- DB/RLS: policy alignment (if used)

### C) UX rules for this task
- Portal vs client-app navigation choice
- State inventory: loading/empty/error/success
- Component system changes (tokens/components)
- Motion + reduced-motion

### D) Risks + Mitigations
List top risks + how you will reduce them.

### E) Rollback plan
- Code rollback (revert/rollback deploy)
- DB rollback or mitigation
- Service worker/update safety if touched

---

## 6) Task List (required artifact)
Write small tasks in safe order; each task must include “How to verify”:
1) Repro / baseline evidence (for bugs)
2) Contracts/types first (reduce churn)
3) DB/RLS/migrations (if needed) + rollback/mitigation
4) Backend/Edge implementation + authz
5) Frontend wiring + UX states + component updates
6) Tests (unit or smoke checklist)
7) Browser verification + RBAC attack simulation
8) Deploy steps + rollback readiness (if applicable)

---

## 7) Quality Gates (must be explicit)
List exact commands (or note they don’t exist and propose minimal scripts):
- lint:
- typecheck:
- tests:
- build:
- preview/dev:

Minimum browser checks:
- Staff: login → core flow
- Admin: login → admin-only action
- Staff tries admin URL directly → blocked
- Staff tries admin action via API replay → blocked
- Deep-link refresh works
- Mobile viewport sanity

If client-facing:
- 360×800 + 390×844 core journey
- touch targets >=44px, keyboard/input sane
- slow network sanity (no dead ends)

---

## 8) Output Format Rule (always)
When you finish work, output:
1) **What changed** (by area: UI / backend / DB / deploy)
2) **How to verify** (exact steps)
3) **Evidence** (screenshots/recordings/notes)
4) **Risks**
5) **Rollback**

Declare DONE only if gates pass and verification is documented.
EOF

echo "Updated: $FILE"
wc -c "$FILE" | awk "{print \"Chars:\", \$1}"

---
name: /kickoff
description: Universal kickoff for DineIn monorepo work. Produces a scope-locked plan, tasks, acceptance criteria, and verification gates before any edits.
---

# /kickoff (DineIn Monorepo)

## 0) Purpose
This workflow runs at the start of EVERY request. It prevents scope creep, enforces dine-in constraints, and makes execution verifiable.

---

## 1) Inputs
- User request (plain language)
- Target area(s): customer | venue | admin | packages/*
- Any URLs/routes/figma references (if provided)

If any required input is missing, make a best effort assumption and proceed with the smallest safe scope.

---

## 2) Triage (classify in 30 seconds)
Pick exactly ONE primary type:
- FEATURE | BUGFIX | REFACTOR | AUDIT | UX-POLISH | PERF | SECURITY | DEPLOY

Then set size:
- XS (≤1 file) | S (≤5 files) | M (≤15 files) | L (>15 files)

If size is L: split into phases and complete Phase 1 end-to-end first.

---

## 3) Scope Lock (hard law check)
Restate the request in 5 lines max and explicitly confirm the NON-negotiables:
- No delivery features
- No maps/location
- No payment APIs/verification
- No in-app scanner
- Statuses only: Placed → Received → Served | Cancelled
- Country derived from venue deep link

If the request conflicts with these, propose the smallest compliant alternative and stop.

---

## 4) Plan (numbered, checkpointed)
Produce a plan with:
- Steps (1..N)
- For each step: output artifact + checkpoint
- Keep steps small and testable

Example checkpoint forms:
- “Route /v/:slug loads menu and sets activeCountry”
- “Cart pill appears when cart > 0”
- “Owner can set order to Served”

---

## 5) Task List (micro-tasks with Definition of Done)
Convert plan into tasks:
- Each task must have:
  - files touched (expected)
  - definition of done (DoD)
  - quick verification method (how to prove it)

Rules:
- Prefer ≤60 minutes of work per task.
- Never start Task 2 before Task 1 is complete and verified.

---

## 6) Acceptance Criteria (measurable)
Define criteria that can be checked:
- Tap budget preserved (≤4 taps to place order from menu)
- No permission prompts
- Works on mobile viewport
- Loading/empty/error states exist
- RLS protections (if backend change)
- E2E path still passes

---

## 7) Verification Plan (evidence required)
Pick appropriate tests:
- Unit tests (core logic)
- Integration tests (db helpers)
- E2E tests (happy paths)

Evidence required:
- commands run
- screenshots or short recording for UI changes
- brief note of edge cases checked

---

## 8) Execution Gate
STOP after producing:
- Scope Lock
- Plan
- Task List
- Acceptance Criteria
- Verification Plan

Do NOT edit files until user approves OR the repo rules allow autonomous edits for XS tasks.

(If autonomous execution is allowed for XS tasks, still produce this output, then proceed.)

'
---
name: /scope-guard
description: Runs before merging or finalizing any feature to ensure dine-in constraints are not violated.
---

# /scope-guard (DineIn)

## 1) Re-check banned features
Confirm none of these exist in code, UI, copy, or routes:
- Delivery, couriers, driver tracking
- Maps integration, location permission prompts
- Payment verification, payment APIs, webhooks
- In-app QR scanning UI/camera permissions
- Non-allowed order statuses

## 2) Confirm entry behavior
- /v/{venueSlug} opens directly to venue menu
- activeCountry derived from venue
- No onboarding flow blocks ordering

## 3) Tap budget audit
From menu screen: Add → Cart → Checkout → Place order
If >4 taps, redesign required.

## 4) Public vs auth gating
- Venue edit and order management require auth
- Public is view-only

## 5) Output
Return a pass/fail checklist and list any violations with exact file paths and fixes.
Stop the merge if any violation exists.

---
name: /ui-spec
description: Produces a complete screen-by-screen UI spec with components, states, and navigation for a given scope.
---

# /ui-spec

## Inputs
- Target app(s): customer | venue | admin
- Feature scope: e.g., "customer ordering flow"

## Output structure (must follow)
For EACH screen:
1) Screen name + route
2) Purpose (1 sentence)
3) Components (bulleted)
4) States: loading | empty | error | success
5) Primary actions (max 2)
6) Tap count impact (must not break budgets)
7) Analytics events (optional, minimal)

Also produce:
- Navigation graph (text)
- Shared widgets list (what goes into packages/ui)
- Copy rules (short, neutral, no fluff)

---
name: /build-slice
description: Implements one vertical slice end-to-end (UI + data + RLS + tests) before moving to the next slice.
---

# /build-slice

## Rule
Build slices, not layers. Each slice must be demonstrable in the browser.

## Steps
1) Run /kickoff for the slice.
2) Generate /ui-spec for included screens.
3) Implement UI with states.
4) Implement data access + types.
5) Apply/verify RLS if needed.
6) Add tests (unit/integration/e2e).
7) Produce evidence (screenshots/recording + commands).

## Output
- What changed (paths)
- What works (demo steps)
- What was tested (commands + results)
- What remains (next slice)
 

