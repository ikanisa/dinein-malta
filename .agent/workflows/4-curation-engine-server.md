---
description: 
---

---
name: /curation-engine-server
description: Implements the server-side curation engine that generates and serves curated blocks for Home and Venue Menu using Gemini tool calling (via the hardened tools contract). Includes caching, retries, baseline fallbacks, realtime publishing, and operational controls.
---

# /curation-engine-server (DineIn)

## 0) Scope lock (non-negotiable)
This workflow implements:
- curation service endpoints for HOME and VENUE_MENU
- orchestration using Gemini with tool calling (server-only)
- caching + dedupe + backoff + fallback to baseline
- persistence to curation_blocks
- operational controls (feature flags, kill switch, budgets)

It must NOT:
- add chat UI
- mention “AI” in frontend UI copy
- add maps/location, payment APIs/verification, in-app scanning, delivery
- allow Gemini writes to orders/menus core

Preserve:
- minimalist UI and fixed slot rendering
- 4-tap ordering target

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Curation engine server"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Service responsibilities
The curation engine must:
1) Decide the segment (or anon_default) using taste profile
2) Serve cached blocks if fresh
3) If cache missing/expired:
   - generate blocks (Gemini)
   - validate outputs strictly
   - store blocks in curation_blocks
   - return blocks
4) If generation fails:
   - fallback to baseline deterministic blocks
   - store fallback blocks
   - log the failure

---

## 3) Endpoints (must implement)
### 3.1 Read endpoints (client-facing)
- GET /curation/home?country=RW&segment?=&variant?=
- GET /curation/venue/:venueId?segment?=&variant?=

Rules:
- segment param is optional; server may override based on profile and personalization toggle
- variant is optional; used for A/B testing

### 3.2 Internal endpoints (admin/dev only)
- POST /curation/rebuild (recompute blocks for a venue/country)
- GET /curation/health (status + cache stats, no secrets)

---

## 4) Caching strategy (must be implemented)
### 4.1 Cache keys
- HOME: (surface=HOME, country, segment, time_bucket, variant)
- VENUE_MENU: (surface=VENUE_MENU, venue_id, segment, time_bucket, variant)

time_bucket:
- use coarse buckets (e.g., 15 min or 60 min) to improve reuse

### 4.2 Cache layers
Pick one:
A) DB-backed cache only (curation_blocks + expires_at) (simple)
B) DB + in-memory cache on server (faster)

Must always use expires_at and updated_at to decide freshness.

### 4.3 Dedupe
Prevent stampedes:
- if a generation run is in-flight for a key, subsequent requests await or return last known blocks

---

## 5) Generation flow (Gemini + tools contract)
Implement `runCuration(surface, ctx)` using the tools registry from Workflow 3.

### 5.1 Prompt contract (strict)
System instruction:
- produce JSON only
- conform to block schema
- no forbidden UI terms
- no claims beyond provided data
- never request new tools

Inputs to model:
- sanitized venue/menu/promos + summarized signals
- never pass raw unbounded OCR text

### 5.2 Tool usage boundaries
- max 10 tool calls per run
- enforce per-tool and per-run row caps
- enforce timeouts

### 5.3 Validation before persist
- schema validation
- id existence checks
- copy rules (no forbidden words)
- item count clamps
- unknown block types discarded

If validation fails:
- fallback to baseline

---

## 6) Baseline fallback (must exist and be reliable)
Use deterministic ranking from Workflow 1:
- HOME: featured/promos -> popularity -> recency
- VENUE_MENU: Popular here, Quick add-ons, Category highlights

Baseline must:
- never require model
- be fast
- always return valid blocks

---

## 7) Operational controls (production safety)
Create config:
- `CURATION_ENABLED` (kill switch)
- `CURATION_MODE` = baseline | gemini | hybrid
- budget caps:
  - MAX_RUNS_PER_MINUTE
  - MAX_TOOL_CALLS_PER_RUN
  - MAX_ROWS_PER_RUN
  - MAX_TOKENS (if applicable)
- degradation policy:
  - if error rate high -> auto-fallback baseline for N minutes
- observability:
  - latency per endpoint
  - success/fallback counts
  - validation reject counts

No UI mention of these.

---

## 8) Realtime publishing (optional in this workflow; can stub)
When blocks are updated in DB:
- clients subscribed to the relevant curation_blocks row should refresh blocks automatically

If realtime wiring is not ready:
- do simple “stale-while-revalidate”:
  - serve cached blocks immediately
  - trigger async rebuild (server-side), next load gets updated

Note: do not promise background work unless your runtime supports it; prefer synchronous rebuild with caching.

---

## 9) Privacy and personalization boundaries
- If personalization_enabled=false:
  - segment forced to anon_default
  - do not use taste features in prompt
- Do not output “because you…” explanations in UI
- Keep reasons internal only in audit logs

---

## 10) Testing & verification
Unit tests:
- cache key composition
- dedupe behavior
- kill switch behavior
- mode switching baseline/gemini/hybrid
- validation failure triggers baseline

Integration tests:
- HOME endpoint returns blocks and persists
- VENUE_MENU endpoint returns blocks and persists
- simulate Gemini tool call failure -> baseline returned

Load test (light):
- 20 requests in burst should not trigger 20 Gemini runs (dedupe works)

---

## 11) Acceptance criteria (measurable)
- Curation endpoints exist and are stable
- Cached blocks served fast; generation is bounded
- Gemini generation is validated and safe
- Baseline fallback works 100% of the time
- Operational kill switch and modes exist
- No forbidden terms reach UI blocks
- No core tables can be written by Gemini paths

---

## 12) Verification evidence
Provide:
- endpoint routes + example requests
- sample returned blocks (sanitized)
- DB rows in curation_blocks (sanitized)
- evidence of mode switching and kill switch
- tests run (commands + results)
- /scope-guard pass/fail

---

## 13) Output format (mandatory)
At end, output:
- Files changed (paths)
- Endpoints created
- Cache + dedupe approach
- Fallback behavior summary
- Ops controls summary
- Tests run
- /scope-guard pass/fail
- Next workflow recommendation: /realtime-block-updates
