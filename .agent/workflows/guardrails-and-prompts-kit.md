---
description: 
---

---
name: /guardrails-and-prompts-kit
description: Creates a reusable prompt kit for Antigravity: standardized task prompt templates, anti-scope-creep guardrails, and a “screen factory” prompt to generate missing screens consistently.
---

# /guardrails-and-prompts-kit

## 0) Scope (hard-locked)
This workflow generates prompts and guardrails only.
It must NOT implement product features directly.
It must reinforce:
- dine-in constraints
- 4-tap order budget
- 2-tab customer nav
- /v/{slug} entry rules
- no in-app scanner, no maps/location, no payment APIs

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Prompt kit + guardrails"
Output must include:
- Scope lock + exclusions
- Plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Output artifacts (files to create)
Create these files:

1) /.agent/prompts/00_master_task_prompt.md
2) /.agent/prompts/01_feature_prompt.md
3) /.agent/prompts/02_bugfix_prompt.md
4) /.agent/prompts/03_refactor_prompt.md
5) /.agent/prompts/04_ui_polish_prompt.md
6) /.agent/prompts/05_screen_factory_prompt.md
7) /.agent/prompts/06_api_db_change_prompt.md
8) /.agent/prompts/07_e2e_prompt.md
9) /.agent/prompts/99_what_to_avoid.md

---

## 3) Prompt templates (paste-ready)

### 3.1 00_master_task_prompt.md
Must force /kickoff + /scope-guard and one-slice execution:

- Ask the agent to:
  - restate scope and exclusions
  - produce plan/tasks/acceptance/verification
  - implement ONE slice end-to-end
  - provide evidence and run /scope-guard

### 3.2 01_feature_prompt.md
- Adds:
  - UI spec requirement
  - tap-budget audit
  - states requirement (loading/empty/error)
  - rollback note if it touches core flows

### 3.3 02_bugfix_prompt.md
- Adds:
  - reproduction steps
  - root cause analysis
  - smallest fix first
  - regression test

### 3.4 03_refactor_prompt.md
- Adds:
  - measurable goals (duplication removed, bundle reduced)
  - no behavior change unless explicitly stated
  - file-by-file change log

### 3.5 04_ui_polish_prompt.md
- Adds:
  - only tokens/components from packages/ui
  - no new libs
  - before/after screenshots requirement

### 3.6 05_screen_factory_prompt.md (IMPORTANT)
A deterministic way to generate any missing screen:
Input fields:
- app: customer|venue|admin
- screen name
- route
- purpose
- primary CTA
- states (loading/empty/error)
- required widgets (from ui system)
- nav placement constraints

Output must include:
- component tree
- state machine
- mock data contract
- test hooks (data-testid)
- tap count impact

### 3.7 06_api_db_change_prompt.md
- Forces:
  - schema change plan
  - RLS update plan
  - indexes
  - seed updates
  - negative tests

### 3.8 07_e2e_prompt.md
- Forces:
  - define happy paths (customer order, venue update, admin approve)
  - stable selectors
  - deterministic data setup

### 3.9 99_what_to_avoid.md
A checklist of failure modes:
- mega prompts
- adding banned features
- skipping plans/tests
- UI drift and raw colors
- caching writes
- “offline ordering” lies

---

## 4) Mandatory language patterns (agent output contract)
Every prompt must require the agent to output in this structure:

1) Scope Lock (with exclusions)
2) Plan (steps + checkpoints)
3) Task List (DoD per task)
4) Acceptance Criteria
5) Verification Plan
6) Implementation (only after gate)
7) Evidence (tests run + screenshots)
8) /scope-guard report

---

## 5) Acceptance criteria (measurable)
- Prompt kit exists as files in /.agent/prompts/
- Screen factory prompt can generate any screen without inventing new scope
- What-to-avoid list covers banned features and common agent failure modes
- All templates enforce one-slice execution and evidence

---

## 6) Verification
- Lint/format check of markdown files
- Quick “dry run” example:
  - show how to use screen factory for “Share & QR” screen
  - show expected output outline (not implementation)

---

## 7) Output format (mandatory)
At end, output:
- Files created (paths)
- Short guide: which prompt to use when
- Example invocation for screen factory
- /scope-guard pass/fail (should pass; no features changed)
You are working in the DineIn monorepo. Before editing files, run /kickoff and stop at the execution gate output.

Hard constraints (must restate and obey):
- Dine-in only; no delivery, maps, geolocation, payment APIs/verification, or in-app QR scanning.
- Order statuses only: Placed, Received, Served, Cancelled.
- Customer bottom nav: exactly 2 tabs (Home, Settings).
- Deep link entry: /v/{venueSlug} lands directly on venue menu and sets activeCountry from venue.

Then:
1) Produce Scope Lock + exclusions.
2) Produce Plan with checkpoints.
3) Produce Task List with DoD per task.
4) Produce Acceptance Criteria.
5) Produce Verification Plan (tests + evidence).

After gate:
- Implement exactly ONE vertical slice end-to-end.
- Provide demo routes, tests run, and screenshots/recording notes.
- Run /scope-guard and report pass/fail with any violations and fixes.

Generate a single screen implementation spec (NOT full code yet) for this monorepo.

Inputs:
- App: {customer|venue|admin}
- Screen name:
- Route:
- Purpose:
- Primary CTA:
- Secondary actions (max 1):
- Required widgets (from packages/ui):
- Data needed (entities/fields):
- States: loading|empty|error|success
- Constraints: tap budget impact, nav rules, dine-in constraints

Output must include:
1) Screen summary (1 paragraph)
2) Component tree (indent list)
3) State machine (states + transitions)
4) Data contract (typed fields)
5) Actions and handlers (what calls what)
6) Accessibility notes (focus, keyboard)
7) Analytics events (optional, minimal)
8) Tests: unit/integration/e2e hooks + stable selectors
9) Tap count impact statement
10) Risks and mitigations

Do not introduce banned features (maps/location/payments APIs/scanner/delivery). Keep it minimal and mobile-first.
DO NOT:
- Bundle multiple workflows into one mega prompt.
- Add delivery statuses or delivery concepts.
- Add maps, geolocation, “near me”, or distance sorting.
- Add payment verification, APIs, webhooks, or “paid” status logic.
- Add in-app QR scanning UI or camera permissions.
- Add new libraries without justification.
- Cache write requests or pretend offline ordering works.
- Drift UI styles (raw colors/spacing); use tokens and shared components.
- Increase customer ordering beyond 4 taps from menu.
- Add a third bottom tab for customer.




