---
description: 
---

---
name: /crashless-go-live-checklist
description: A practical, crash-resistant go-live checklist for the DineIn monorepo: staging parity, migrations discipline, smoke tests, monitoring, incident playbook, and day-1 support flow. No feature work.
---

# /crashless-go-live-checklist (DineIn)

## 0) Scope (hard-locked)
This workflow produces a go-live checklist + runbook and implements only tiny non-feature safety improvements (docs, scripts, flags).
It must NOT add product features, integrations, or new journeys.

Must preserve:
- dine-in constraints (no maps/location, no payment APIs/verification, no scanner UI, no delivery)
- ordering ≤ 4 taps
- customer 2-tab nav

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Crashless go-live checklist"
Output must include:
- Scope lock + exclusions
- Plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Go-live readiness scoreboard (single page)
Create `/docs/go-live/scoreboard.md` with a checklist and statuses:

Categories:
- Build & Deploy
- Data & RLS
- PWA Quality
- Journeys (Customer/Venue/Admin)
- Observability
- OCR Pipeline
- Abuse Controls
- Support Playbook
- Rollback Plan

Each item has:
- Owner (role)
- Status (Not started / In progress / Done)
- Evidence link (doc path, screenshot, CI run)

---

## 3) Staging parity rules (non-negotiable)
Create `/docs/go-live/staging-parity.md`:

Must match between staging and prod:
- DB schema version (migrations)
- RLS policies
- Edge functions versions
- Storage buckets and permissions
- Env vars (same names; different values)
- Seed strategy (safe, non-sensitive)

Ban:
- “It works locally” as a release criterion.

---

## 4) Migration discipline (prevents midnight disasters)
Create `/docs/go-live/migrations.md`:

Rules:
- No manual DB edits in production.
- All changes via migrations.
- Every migration includes:
  - purpose
  - rollback note (forward-fix preferred)
- Release must record:
  - migration IDs applied
  - timestamp
  - who applied

Add a helper script (if repo supports it):
- `pnpm db:status`
- `pnpm db:apply:staging`
- `pnpm db:apply:prod`
(Commands are examples; adapt to your stack.)

---

## 5) Smoke tests (day-1 must-pass)
Create `/docs/go-live/smoke-tests.md` with exact steps and pass criteria.

### Customer smoke (RW + MT)
- Open /v/{rw-slug} -> menu loads
- Add item -> cart -> checkout -> place order
- Verify status shows Placed
- Verify payment handoff text is correct (no verification claim)

Repeat for MT slug.

### Venue smoke
- Login -> orders queue visible
- Update order: Placed -> Received -> Served
- Bell call: new call visible -> Ack -> Cleared

### Admin smoke
- Login -> claims list visible
- Approve claim -> venue owner assigned
- Audit event exists (if logs enabled)

PWA smoke:
- installable
- no camera/location permission prompts
- offline browse works after one visit

---

## 6) Monitoring & alerts (minimal but sufficient)
Create `/docs/go-live/monitoring.md`:

Minimum signals to watch:
- error rate (client + server)
- order creation fail rate
- menu load fail rate
- OCR job failure rate
- latency spikes

Alert thresholds (starter):
- menu load fails > 3% (5-min window)
- order create fails > 2%
- OCR failures > 10% (hourly)

Where to see it:
- logs dashboard (provider-specific)
- telemetry table queries (if implemented)

---

## 7) Incident response runbook (simple, fast)
Create `/docs/go-live/incident-runbook.md`:

Include:
- Severity levels (S1–S3)
- Who is on point
- Triage steps:
  1) confirm scope (RW/MT, specific venue, all users)
  2) check deployment version
  3) check DB migrations applied
  4) check RLS denials logs
  5) check Edge function errors
- Communication templates (short)
- Decision tree:
  - hotfix forward vs rollback
- Postmortem template (1 page)

---

## 8) Day-1 support playbook (operational reality)
Create `/docs/go-live/day1-support.md`:

Support flows:
- Venue can’t see orders
- Customer can’t load menu
- Venue claim stuck pending
- Payment confusion (manual verification reminder)
- OCR parsing wrong (staging edit workflow)
- “Add to Home Screen” help

Include:
- exact admin actions to resolve
- what logs to check
- what NOT to promise (no payment verification)

---

## 9) Rollback plan (apps + DB)
Create `/docs/go-live/rollback.md`:

Apps:
- how to redeploy previous version
- triggers to rollback (deep link broken, ordering broken, venue updates broken)

DB:
- prefer forward-fix migrations
- only revert safe migrations explicitly tagged

---

## 10) Pre-launch data hygiene
Create `/docs/go-live/data-hygiene.md`:

- Confirm venues in RW/MT have:
  - correct country_id
  - status=Active
  - slug unique
  - payment handle fields valid per country
- Confirm demo/test venues hidden or tagged (not shown in production discovery)
- Confirm no real phone numbers/emails in seed

---

## 11) Final go-live gate (must be a single command list)
Create `/docs/go-live/final-gate.md`:

A single sequential list:
1) Freeze main
2) Apply staging migrations
3) Deploy staging apps
4) Run smoke tests
5) Apply prod migrations
6) Deploy prod apps
7) Run prod smoke tests
8) Monitor 60 minutes
9) Announce go-live

Include links to the smoke test doc and rollback doc.

---

## 12) Acceptance criteria (measurable)
- All docs exist under /docs/go-live/
- Scoreboard is complete and references evidence
- Smoke tests are executable and unambiguous
- Monitoring and incident runbook are actionable
- Rollback plan exists and is realistic
- No product features were added

---

## 13) Verification evidence
Provide:
- list of created docs
- any scripts added
- example “go-live gate” run output (if scripts exist)
- /scope-guard pass/fail

---

## 14) Output format (mandatory)
At end, output:
- Docs created (paths)
- Scoreboard summary (what’s Done vs Pending)
- Any scripts added
- Next steps for launch day
- /scope-guard pass/fail
