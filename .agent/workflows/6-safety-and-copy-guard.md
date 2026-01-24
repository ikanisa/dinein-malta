---
description: 
---

---
name: /safety-and-copy-guard
description: Adds hard safety rails for curated content: forbidden wording checks, length limits, ID existence validation, merchandising constraints (upsell caps), allergen/health claim restrictions, and abuse controls. Ensures curated blocks can never violate minimalist UX or trust.
---

# /safety-and-copy-guard (DineIn)

## 0) Scope lock (non-negotiable)
This workflow adds:
- centralized copy policy and validators
- server-side enforcement for curation outputs
- client-side defensive rendering rules
- abuse controls (rate limits, anomaly detection)
- merchandising constraints (upsell rules)

It must NOT:
- add chat UI
- mention “AI” in UI wording
- add maps/location, payment APIs/verification, scanning, delivery
- change ordering journey or exceed 4 taps

Preserve:
- fixed slot architecture
- minimal UI

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Safety + copy guard"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Copy policy (single source of truth)
Create:
- `packages/core/copy/policy.ts`
- `/docs/policy/copy-policy.md`

### 2.1 Forbidden terms (UI-visible)
Hard block if found in any persisted block field:
- ai, artificial intelligence, assistant, bot, model, ml, machine learning, powered by

Include case-insensitive matching and leetspeak variants where practical.

### 2.2 Allowed labels (recommended)
- Smart Picks
- Recommended
- Popular here
- Pairs well
- Quick add-ons
- Trending
- New & notable

### 2.3 Tone rules
- short, neutral, no hype
- no “best in the country” claims unless admin-curated and sourced
- no “because you…” explanations (privacy)

---

## 3) Safety policy for food/drinks claims
Create `/docs/policy/food-claims-policy.md`:
- No medical claims (e.g., “cures”, “healthy for…”)
- No allergy certainty (“gluten-free”, “nut-free”) unless venue explicitly verified and stored as verified flags
- If dietary tags are inferred:
  - must be labeled internally as inferred
  - UI must avoid certainty words; use neutral tags like “Vegetarian option” only if venue provided
- Alcohol: do not push aggressive upsell wording; keep neutral

Enforce these rules via validators.

---

## 4) Merchandising constraints (keeps UX minimalist + trustworthy)
Implement constraints in server validators:
- upsell_row:
  - max 3 items
  - cannot include items already in cart
  - must not include high-priced items if user is in budget segment (optional, safe)
  - must not appear if cart is empty (optional; or show “Popular add-ons” only if not distracting)
- promo_strip:
  - max 5 promos
  - promos must come from venue/admin data (not invented)

Define “slot budget”:
- HOME max 4 blocks
- VENUE_MENU max 3 blocks visible by default

---

## 5) “No hallucinated IDs” enforcement (server-side)
Before persisting blocks:
- Validate every referenced venue_id and item_id exists
- Validate item_id belongs to venue_id for VENUE_MENU and CART_UPSELL surfaces
- Reject and fallback to baseline if any mismatch

Add a validator module:
- `packages/core/curation/validate/blockValidator.ts`

Must include:
- schema validation
- forbidden word scan
- length clamps
- enum enforcement
- ID existence verification
- cross-venue leakage prevention

---

## 6) Client-side defensive rendering (belt + suspenders)
Even though server validates, client must:
- ignore unknown block types
- clamp items counts
- clamp title/subtitle lengths
- never render HTML
- if block fails local validation:
  - hide block (do not break screen)
  - log a non-fatal telemetry event: `curation_block_rejected_client`

---

## 7) Abuse controls (rate limits + anomaly detection)
### 7.1 Rate limiting (server)
- already present in tools contract; harden here with:
  - per session_id limit
  - per venue_id limit
  - per IP (if feasible)
  - exponential backoff for repeated invalid requests

### 7.2 Anomaly detection (light)
Detect and log:
- repeated requests with changing segment/variant to bypass cache
- unusually high rebuild calls
- repeated validation failures (possible injection attempts)

Write to:
- `curation_anomalies` table (optional) or logs

---

## 8) Audit trail (explainability without showing it)
Store internal reasons but keep UI clean:
- block meta can store `reason_codes` internally (not rendered)
- curation_runs stores a brief summary
- never show “because you…” in UI

---

## 9) Testing & verification
Unit tests:
- forbidden term detection (case + variants)
- length clamping
- enum enforcement
- ID existence validation (mock)
- cross-venue item mismatch rejection
- upsell exclusions (no duplicates with cart)

Integration:
- attempt to persist blocks containing forbidden wording -> blocked and fallback baseline
- attempt to persist blocks with non-existent item IDs -> blocked and fallback baseline

Manual QA:
- ensure UI never displays forbidden terms
- ensure no jitter or new steps introduced

---

## 10) Acceptance criteria (measurable)
- Copy policy exists and is enforced server-side before any persist
- Client also defensively validates blocks
- “No hallucinated IDs” enforced
- Upsell and promo blocks cannot be invented
- Abuse controls are implemented and logged
- UI remains minimalist and journeys unchanged

---

## 11) Verification evidence
Provide:
- files changed (paths)
- tests run (commands + results)
- examples of blocked outputs (sanitized logs)
- screenshots confirming neutral labels
- /scope-guard pass/fail

---

## 12) Output format (mandatory)
At end, output:
- Files changed (paths)
- Policy summary
- Validator summary
- Abuse controls summary
- Tests run
- /scope-guard pass/fail
- Next workflow recommendation: /experiments-lite
