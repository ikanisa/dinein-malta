---
description: 
---

---
name: /ocr-pipeline-hardening
description: Implements a robust, safe OCR ingestion pipeline for menus: upload -> job queue -> Gemini OCR -> parse -> staging -> venue review -> publish. Includes retries, failure modes, and “never publish raw OCR” enforcement.
---

# /ocr-pipeline-hardening (DineIn)

## 0) Scope (hard-locked)
This workflow hardens menu OCR ingestion only.
Must NOT add:
- delivery, maps/location, payment APIs/verification, in-app scanning, extra order statuses.

Non-negotiable:
- OCR output must go to STAGING tables and must never auto-publish.

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "OCR pipeline hardening"
Output must include:
- Scope lock + exclusions
- Plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Pipeline architecture (server-side only)
Client (venue portal) does:
- upload file
- create ingest job record
- monitor job status
- review staging items
- approve/publish

Server-side worker does:
- fetch file (from storage)
- call Gemini OCR
- parse menu into structured items
- write staging records
- update job status

Rule:
- Gemini API keys must never be exposed to client.
- OCR calls must happen server-side (Edge Function / server action / worker).

---

## 3) Required DB tables (minimum)
If not already present, create:

### 3.1 menu_ingest_jobs
- id uuid pk
- venue_id uuid
- created_by uuid (user_id)
- file_path text (storage path)
- status enum:
  - Pending
  - Running
  - NeedsReview
  - Published
  - Failed
- error_code nullable
- error_message nullable (sanitized)
- attempt_count int default 0
- next_attempt_at timestamp nullable
- started_at, finished_at nullable
- created_at

### 3.2 menu_items_staging
- id uuid pk
- job_id uuid references menu_ingest_jobs(id)
- venue_id uuid
- raw_category text
- name text
- description nullable
- price numeric nullable
- currency text nullable
- confidence numeric nullable
- parse_warnings text[] default {}
- suggested_action enum: Keep|Edit|Drop (default Keep)
- created_at

### 3.3 menu_publish_events (optional but recommended)
- id uuid pk
- venue_id uuid
- job_id uuid
- published_by uuid
- published_at

---

## 4) RLS & permissions
- Venue owners can:
  - create jobs for their venue
  - read their own jobs and staging rows
  - publish jobs for their venue
- Admin can read all and override publish if needed
- Public cannot access jobs or staging

Enforce:
- only owners/admin can call publish action
- publish action must verify job.status == NeedsReview

---

## 5) Worker design (retries + idempotency)
### 5.1 Idempotency rule
- A job must not produce duplicate staging rows if retried.
Approach:
- On worker start, if job.status == Running and attempt_count increased, clear previous staging rows for that job before writing new ones (or use upsert with stable keys).

### 5.2 Retry policy
- Retry transient failures (timeouts, rate limits) with exponential backoff:
  - attempt 1: +1 min
  - attempt 2: +5 min
  - attempt 3: +15 min
  - attempt 4: +60 min
- Max attempts: 4 (then Failed)
- Non-retry failures:
  - unsupported file type
  - unreadable file (persistently)
  - parsing produced zero usable items (mark NeedsReview but flag warnings)

### 5.3 Concurrency
- Ensure a job can only be processed by one worker at a time:
  - claim job via atomic update (Pending -> Running) where status=Pending and (next_attempt_at is null or <= now)
  - if update returns 0 rows, another worker has it

---

## 6) Gemini OCR prompt contract (structured output)
Define a strict prompt for OCR that requests:
- categories
- items
- prices
- currency (infer if possible, else null)
- warnings for ambiguous text

Output must be JSON with a schema.
If model output is invalid JSON:
- set job status to NeedsReview with error_code=INVALID_JSON and store raw output securely (server-only) if needed.

Never store full raw OCR text in client-accessible tables.

---

## 7) Venue review UX (staging editor)
In venue portal:
- show staging rows grouped by raw_category
- inline editing:
  - category name mapping
  - item name
  - price
  - availability default true
- allow “Drop” items easily
- show parse warnings unobtrusively
- show a “Publish menu” sticky CTA at bottom

Rules:
- No photos required
- Keep editing minimal (mobile-first)

---

## 8) Publish operation (safe + atomic)
Publish must:
1) Verify owner/admin
2) Verify job.status == NeedsReview
3) Create a new menu version (menus table)
4) Create categories/items from staging (after edits)
5) Mark previous menu inactive (if versioned)
6) Set new menu active
7) Set job.status = Published
8) Write menu_publish_event
9) Write audit event

Atomicity:
- Use a transaction (SQL function or server-side transaction).

Hard rule:
- No direct “Publish” from worker.

---

## 9) File upload constraints
Accept:
- PDF
- JPG/PNG
Reject:
- huge files above max size (set explicit limit)
- unknown formats

Store in:
- Supabase storage bucket: menu_uploads/{venueId}/{jobId}/...

Add virus scanning only if required later; keep out of scope for v1.

---

## 10) Implementation sequence (in order)
1) DB tables + RLS
2) Storage upload flow (venue portal)
3) Job creation API (server-side)
4) Worker/Edge Function processor with retries
5) Staging UI viewer/editor
6) Publish transaction function
7) Audit + logs
8) E2E: upload -> process -> review -> publish

Run /scope-guard (must pass)

---

## 11) Acceptance criteria (measurable)
- Upload creates job in Pending
- Worker moves Pending -> Running -> NeedsReview (or Failed)
- Staging rows appear for venue owner only
- Publishing creates new active menu version
- Raw OCR output is never auto-published
- Retries do not duplicate staging rows
- Failure modes are visible and actionable (job status + retry info)

---

## 12) Verification evidence
Provide:
- job lifecycle screenshots (venue portal)
- logs showing retries/backoff
- DB rows: job + staging + menu version created
- E2E test output if implemented

---

## 13) Output format (mandatory)
At end, output:
- Files created/changed (paths)
- DB migrations + policies summary
- Worker retry policy summary
- Demo steps
- Tests run (commands + results)
- Known gaps + next workflow recommendation
- /scope-guard pass/fail
