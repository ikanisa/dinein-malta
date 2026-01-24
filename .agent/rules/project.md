---
trigger: always_on
---

# Workspace Rules — dinein

## Identity
- Monorepo internal system with TWO primary profiles: Staff and Admin.
- AI-first autonomous agent system delivered as a modern PWA.\n- This project is MOBILE-FIRST and must feel native-app-like (touch-first, fast, smooth, thumb-reachable).

## UX/Design non-negotiables
- Minimalist, enforce consistency, “Soft Liquid Glass” where appropriate.
- Responsive across breakpoints.
- Subtle motion (must respect reduced-motion).
- Every page: loading + empty + error states (no blank screens).

## Security non-negotiables
- Staff/Admin RBAC must be enforced in UI + API/server + DB/RLS (when used).
- Never UI-only permissions.
- Least privilege for tools, tokens, and browser access.

## Quality gates (must list exact commands in Walkthrough)
- lint:
- typecheck:
- tests:
- build:
- manual smoke:
  - Staff core flow:
  - Admin core flow:

## Repo boundaries (fill in as you discover)
- apps/ contains:
- packages/ contains:
- supabase/ contains:  
# DineIn Monorepo PWA — GENERAL RULES (v1)

These rules define how the agent plans, codes, tests, and ships changes in this repo.
They complement STARTER RULES and must not override any scope boundaries.

---

## A) Operating Mode (how you work with Antigravity)

### A1) Policies (recommended defaults)
- Review Policy: **Request Review**
- Terminal Execution Policy: **Request Review** (or Auto only after repo is stable)
- Browser: enable **URL allowlist** and use it strictly.

Rationale: Antigravity is agent-first and can plan/execute across editor/terminal/browser; these policies keep you in control. (See Antigravity docs/codelab.) :contentReference[oaicite:0]{index=0}

### A2) Allowed browsing sources (tight)
Only use:
- Official Antigravity docs
- Supabase docs
- Next.js docs
- Chrome/Workbox PWA docs
- Revolut/MoMo official docs if needed

Anything else requires explicit user approval.

### A3) Artifact discipline (always “show your work”)
For every unit of work, produce and keep updated:
1) Scope Lock (with exclusions)
2) Plan (steps + checkpoints)
3) Task list (each with Definition of Done)
4) Acceptance criteria (measurable)
5) Evidence (tests run + key screenshots/recordings if UI)

No skipping.

---

## B) Repo Hygiene (monorepo consistency)

### B1) Structure rules
- Never create new apps casually. Only these apps exist:
  - apps/customer
  - apps/venue
  - apps/admin
- Shared UI and design tokens go ONLY in packages/ui.
- Shared types, enums, constants (statuses, routes) go ONLY in packages/core.
- Supabase types and data-access helpers go ONLY in packages/db.
- Avoid copy/paste duplication across apps: refactor into packages.

### B2) Naming & routing
- Routes must be consistent across apps.
- Deep link route is canonical:
  - /v/{venueSlug}
  - optional ?t={tableNo}
- Do not introduce additional entry routes without a plan.

### B3) Single source of truth
- Order statuses: Placed, Received, Served, Cancelled (only).
- Payment method values: Cash, MoMoUSSD, RevolutLink (only).
- Country values: RW, MT (only).

---

## C) Coding Standards (boring, predictable, maintainable)

### C1) TypeScript strictness
- TypeScript strict mode ON.
- No `any` unless it is behind a typed adapter with justification.

### C2) UI component rules
- Use composition over inheritance.
- All reusable components must:
  - accept className
  - support loading/disabled states
  - support keyboard focus
  - avoid inline styles (use tokens/classes)

### C3) Error handling
- Every async operation must have:
  - loading state
  - empty state
  - error state with user-friendly copy
- Never show raw stack traces to users.

### C4) Performance budgets (non-negotiable)
- No heavy libraries without justification.
- Avoid large JSON payloads; paginate and filter.
- Avoid rerender storms: memoize where necessary, prefer server-state caching.

---

## D) UI/UX Quality Gates (mobile-first PWA)

### D1) Tap-budget enforcement
- Customer ordering from menu must remain ≤ 4 taps:
  Add -> Cart -> Checkout -> Place order
- Any change that increases taps requires a redesign proposal (not implementation).

### D2) No permission prompts
- Absolutely no camera scan UI inside the app.
- No geolocation prompts.

### D3) Install prompt etiquette
- Show Add-to-Home-Screen prompt only after meaningful engagement.
- Never on first paint. Never repeatedly.

### D4) Accessibility basics
- All interactive elements must be keyboard accessible.
- Ensure visible focus states.
- Color contrast must be acceptable in both light and dark surfaces.

---

## E) Data, Security, and RLS Discipline (Supabase-first)

### E1) RLS must protect everything
- Any table with user/venue/admin write access must have RLS enabled.
- Policies must be tested (positive + negative cases).

### E2) Public vs authenticated data
- Public read: active venues, menus, categories, items, promos.
- Auth write: only owners can write their venue/menu/orders/bell.
- Admin write: claim approvals, assignments, global moderation.

### E3) Secrets and env
- Never print .env contents.
- Add new env vars only with:
  - name
  - scope (which app)
  - reason
  - default behavior if missing

---

## F) Testing Rules (minimum viable confidence)

### F1) Required test layers per feature
- Unit tests for pure functions (core logic, formatters, validators).
- Integration tests for data access helpers.
- E2E “happy path” for:
  - QR deep link -> menu -> order
  - Venue login -> order status update
  - Admin claim approval

### F2) Deterministic builds
- Lock dependency versions.
- Avoid “works on my machine” steps. Document commands.

---

## G) Commits and Change Management

### G1) Small PRs / small changes
- Prefer a sequence of small, reviewable changes.
- No “mega-commit that changes everything” unless explicitly requested.

### G2) Commit message standard
Format:
- feat(customer): …
- feat(venue): …
- feat(admin): …
- fix(core): …
- chore(repo): …

### G3) Definition of done (global)
A feature is done only when:
- Mobile viewport works end-to-end
- Tap budget preserved
- States handled (loading/empty/error)
- Tests run and recorded
- No scope boundary violations

---

## H) What to avoid (common Antigravity failure modes)

- “Big bang” prompts that bundle multiple workflows.
- Introducing excluded features (maps, location, payment APIs).
- UI churn without acceptance criteria.
- New libraries added for convenience instead of need.
- Editing many files without first producing a plan + task list.

