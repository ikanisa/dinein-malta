---
description: 
---

---
name: /experiments-lite
description: Adds a minimal experimentation framework for curated blocks (titles, ordering, item selection) without changing UI structure, navigation, or tap budgets. Includes variant assignment, exposure logging, and guardrails.
---

# /experiments-lite (DineIn)

## 0) Scope lock (non-negotiable)
This workflow creates:
- simple variant assignment for curation blocks
- exposure + outcome logging
- guardrails to prevent UX drift
- a tiny admin/dev view for experiment status (optional)

It must NOT:
- change journeys or UI layout
- add chat UI
- mention “AI” in UI copy
- add maps/location, payment APIs/verification, scanning, delivery

Preserve:
- fixed slot structure
- ordering ≤ 4 taps

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Experiments lite"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) What is allowed to experiment (strict)
Allowed:
- block ordering (within the same slot area)
- block titles among approved labels
- which items appear inside a block (IDs only)
- variant-specific thresholds (e.g., number of venues shown within allowed max)

Not allowed:
- adding new block types
- increasing number of blocks beyond limits
- adding new user steps
- changing checkout flow
- changing navigation

---

## 3) Variant assignment (privacy-safe)
Implement in `packages/core/experiments/`:

### 3.1 Inputs
- session_id (primary)
- country
- surface (HOME or VENUE_MENU)

### 3.2 Method
- deterministic hash bucketing:
  - 90% control (A)
  - 10% variant (B) initially
- store assigned variant per (surface, experiment_id) in local storage and optionally DB

Rules:
- variant must be stable for a session for 7 days
- respect “Personalized suggestions” toggle:
  - experiments can still run, but must not use taste profile if personalization is off (or keep separate experiment flags)

---

## 4) Storage model (Supabase)
### 4.1 experiments table
- id text pk (e.g., home_blocks_v1)
- surface text
- country text
- status text (draft|running|paused|stopped)
- traffic jsonb (e.g., {A:0.9,B:0.1})
- rules jsonb (allowed changes summary)
- created_at, updated_at

### 4.2 experiment_exposures table
- id uuid pk
- ts timestamptz
- experiment_id
- variant
- surface
- country
- session_id
- venue_id nullable
- meta jsonb (block ids shown, counts)

RLS:
- inserts allowed via server/edge only
- selects admin-only

### 4.3 experiment_outcomes table (minimal)
- id uuid pk
- ts
- experiment_id
- variant
- session_id
- outcome_name (order_placed, add_to_cart, venue_open)
- value number (optional)

---

## 5) Wiring into curation engine
Update curation engine:
- accept `variant` as input or compute server-side from experiments table
- include variant in cache key
- persist blocks with `variant` column set

Guardrails:
- any variant output must pass the same validators
- if experiments misconfigured -> default to control A

---

## 6) Outcome definitions (simple, meaningful)
For HOME:
- venue_open rate
- menu_view rate
- add_to_cart rate
- order_placed rate (if within session window)

For VENUE_MENU:
- add_to_cart rate
- upsell add rate (if upsell block exists)
- order_placed rate

Attribution window:
- within same session (keep simple)

---

## 7) Admin/dev visibility (optional but recommended)
Add an admin-only page:
- shows running experiments and traffic split
- shows last 24h exposures and outcomes summary
- no user PII displayed (only counts)

---

## 8) Testing & verification
Unit:
- deterministic bucketing stable for session_id
- traffic split allocation
- variant fallback if config missing

Integration:
- curation endpoint returns blocks with variant field
- exposures logged when blocks rendered (client -> server event or server side)

Manual QA:
- ensure UI doesn’t change layout between variants
- ensure no new steps introduced

---

## 9) Acceptance criteria (measurable)
- Experiments can run on HOME and VENUE_MENU surfaces
- Variant assignment is stable and privacy-safe
- Exposures and outcomes are logged
- Guardrails prevent layout/journey drift
- Validators still enforce copy rules and ID existence
- Ordering flow remains ≤ 4 taps

---

## 10) Verification evidence
Provide:
- files changed (paths)
- DB migrations summary
- sample exposure/outcome rows (sanitized)
- tests run (commands + results)
- /scope-guard pass/fail

---

## 11) Output format (mandatory)
At end, output:
- Files changed (paths)
- Experiments configured (ids + splits)
- Logging summary
- Tests run
- /scope-guard pass/fail
- Next workflow recommendation: (optional) /places-enrichment-admin-only
