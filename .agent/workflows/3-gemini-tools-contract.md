---
description: 
---

---
name: /gemini-tools-contract
description: Defines a hardened server-only “tool calling” contract for Gemini: strict allowlist, JSON schemas, validators, rate limits, and audit logs. Gemini can read curated DB views and write only to curation outputs—never to orders/menus core.
---

# /gemini-tools-contract (DineIn)

## 0) Scope lock (non-negotiable)
This workflow creates:
- a strict tool calling contract for Gemini (server-side only)
- tool schemas + validators
- allowlist enforcement + rate limits
- audit logging and traceability
- a “safe data layer” for reads (views/RPCs)

It must NOT:
- expose Gemini keys to the client
- allow Gemini to write to core business tables (orders, venues core, menus core)
- add chat UI or “AI” wording in frontend
- add maps/location, payment APIs/verification, in-app scanning, delivery

Preserve:
- existing UI flows and constraints
- curation blocks schema from `/curation-schema-and-slots`

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Gemini tools contract"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Threat model (must be written)
Create `/docs/security/gemini-tools-threat-model.md` covering:
- prompt injection (menu text, venue fields, user inputs)
- tool abuse (calling unexpected tools, huge queries)
- data exfiltration (pulling private rows)
- privilege escalation (writing to restricted tables)
- output poisoning (returning IDs not in DB, unsafe copy)

Mitigations must map to implementation in this workflow.

---

## 3) Tool contract architecture
Implement a server module:
- `packages/core/curation/tools/registry.ts`
- `packages/core/curation/tools/schemas.ts`
- `packages/core/curation/tools/validators.ts`
- `packages/core/curation/tools/rateLimit.ts`
- `packages/core/curation/tools/audit.ts`

Rules:
- Tools are registered in a single registry.
- Only tools in registry can be invoked.
- Each tool has:
  - JSON schema (input + output)
  - validation
  - authorization requirements
  - max cost limits (row caps, timeouts)

---

## 4) Safe Read Surface (no raw SQL)
Gemini must never receive direct SQL execution ability.

Create “safe read” endpoints (choose one approach, keep consistent):
A) Supabase RPC functions returning shaped data (recommended)
B) Server-side query functions in packages/db using strict selects

All reads MUST:
- enforce country scoping and venue scoping
- return only necessary columns (no secrets, no internal flags)
- cap results (pagination)
- be deterministic

---

## 5) Allowed Tools (v1 allowlist)
### 5.1 Read tools (allowed)
- getVenue(venue_id)
- listVenues(country, limit, cursor?, filters?)
- getActiveMenu(venue_id)
- getMenuItemsByIds(venue_id, item_ids[])
- getPopularItems(venue_id, window, limit)
- getCountryTrendingItems(country, window, limit)
- getPromos(country, venue_id?, now)
- getTasteProfile(session_id|user_id, country)  (returns segment + bounded features only)
- searchVenues(country, query, limit)
- searchMenuItems(venue_id, query, limit)

### 5.2 Write tools (allowed, tightly restricted)
- upsertCurationBlocks(surface, country, venue_id?, segment, blocks[], expires_at, variant?)
- upsertMenuAnnotations(venue_id, annotations[])   (optional, can defer)
- logCurationRun(run_id, surface, country, venue_id?, segment, input_hash, output_hash, source, model_version)

### 5.3 Explicitly forbidden (never implement)
- createOrder, updateOrderStatus, publishMenu, approveClaim, reassignOwner
- any tool that modifies core business state

---

## 6) Schemas (strict JSON; reject anything else)
Create JSON schema definitions for every tool:
- inputs: types, required fields, max lengths
- outputs: minimal, typed

Examples of hard limits:
- query strings max 80 chars
- listVenues limit max 20
- search* limit max 12
- getActiveMenu returns max categories 50, items 500 (or lower if needed)
- upsertCurationBlocks blocks length max 4; items per block as per block contract

All schemas must be used at runtime to validate:
- tool call input from Gemini
- tool response back to Gemini (to prevent leaking data accidentally)

---

## 7) Validators (beyond schema)
### 7.1 ID validation
For any tool that accepts IDs:
- verify IDs exist in DB
- verify venue_id matches the current request context if applicable
- verify item_ids belong to that venue (no cross-venue leakage)

### 7.2 Copy rule validation (no “AI”, no unsafe claims)
Before writing blocks:
- enforce frontend copy rules:
  - no forbidden terms: "AI", "assistant", "powered by", "ML"
  - no medical/allergen certainty phrases
  - max lengths for title/subtitle/badges
- enforce: only known block_type/surface enums

### 7.3 “No hallucinated entities”
- every referenced venue_id and item_id must be verified before persist
- if any fail, reject write and log error

---

## 8) Authorization model (server-side)
Even though this is server-only, still enforce:
- tool calls for customer curation must be scoped to:
  - country (RW/MT)
  - venue_id (if venue surface)
  - segment (from taste profile or anon_default)
- write tools can only write:
  - curation_blocks rows in allowed keys
  - optional annotations for allowed venues

No admin/owner privileges here unless explicitly needed for a future workflow.

---

## 9) Rate limiting & cost controls
Implement rate limiting per:
- session_id (customer)
- venue_id (venue surface)
- country+segment (home surface)

Example policy:
- home curation generation: max 1 per 5 minutes per (country, segment)
- venue menu curation generation: max 1 per 2 minutes per (venue_id, segment)
- search tools: max 5 per minute per session

Cost controls:
- tool execution timeout (e.g., 2–5s per tool)
- max tool calls per orchestration run (e.g., 10)
- max total rows read per run (e.g., 2,000)

---

## 10) Audit logging (traceability)
Create table migration:

### 10.1 curation_tool_audit
- id uuid pk
- ts timestamptz
- run_id uuid
- tool_name text
- caller text (curation_service)
- country text
- venue_id uuid nullable
- segment text
- request_json jsonb (redacted where needed)
- response_meta jsonb (row counts, latency, status)
- status text (ok|error|blocked)
- error_code text nullable

Rules:
- do NOT store raw menu descriptions or user-entered free text beyond limits
- store hashes for large payloads (input_hash/output_hash)

---

## 11) Orchestrator handshake contract (how Gemini calls tools)
Define a single orchestrator entry:
- `runCuration(surface, country, venue_id?, session_id?, user_id?, now) -> blocks`

Within run:
1) compute segment (or anon_default)
2) fetch minimal context via read tools
3) ask Gemini to produce blocks STRICTLY adhering to schema
4) validate output:
   - schema + validators + copy rules + id existence
5) write blocks via upsertCurationBlocks
6) return blocks to client (cached)

Critical rule:
- If Gemini output fails validation, fallback to baseline blocks (deterministic) and log failure.

---

## 12) Prompt hygiene (injection defense)
Implement:
- do not pass raw user-generated text directly to Gemini
- sanitize venue fields and menu text:
  - strip URLs
  - cap lengths
  - remove suspicious patterns (“ignore instructions”, “call tool X”)
- always include a system instruction:
  - “You may only produce JSON in the block schema.”
  - “Never request new tools.”
  - “Never output text for UI beyond allowed lengths.”
- treat menu OCR text as untrusted input.

---

## 13) Testing & verification
Unit tests:
- schema validation rejects invalid calls
- forbidden tool name is blocked
- output validation rejects forbidden words + too many items
- cross-venue ID leakage rejected
- rate limiter blocks repeated calls

Integration test:
- runCuration(HOME, RW) returns blocks and writes to curation_blocks
- simulate invalid Gemini output -> baseline fallback works

Security test (basic):
- injection string in menu description does not change tool behavior

---

## 14) Acceptance criteria (measurable)
- Gemini can only call tools from allowlist
- Every tool call is schema-validated + logged
- Writes are restricted to curation tables only
- Cross-country and cross-venue leakage is prevented
- Invalid model output triggers baseline fallback, not broken UI
- No “AI”/assistant wording can reach the UI blocks
- Keys remain server-side only

---

## 15) Verification evidence
Provide:
- file paths for registry/schemas/validators
- migration ids + RLS summary (if any)
- example audit rows (sanitized)
- tests run (commands + results)
- /scope-guard pass/fail

---

## 16) Output format (mandatory)
At end, output:
- Files changed (paths)
- Tool allowlist summary
- Rate limit settings
- Audit logging summary
- Tests run
- /scope-guard pass/fail
- Next workflow recommendation: /curation-engine-server
