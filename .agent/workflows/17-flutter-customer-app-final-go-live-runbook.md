---
description: 
---

---
name: /flutter-customer-app-final-go-live-runbook
description: Produces a single, end-to-end go-live runbook for the Flutter customer app: release gates, staging→prod steps, deep link verification, backend readiness checks, monitoring, support playbook, and rollback.
---

# /flutter-customer-app-final-go-live-runbook (Customer Flutter App)

## 0) Scope lock (non-negotiable)
This workflow creates:
- one authoritative launch runbook doc set
- final release gates checklist
- monitoring + incident + rollback procedures

It must NOT:
- add new product features or screens
- introduce login/signup
- add maps/location/payment APIs/delivery

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Flutter customer app go-live runbook"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Runbook deliverables (must produce)
Create the following docs:

1) `/docs/flutter_customer/go_live/runbook.md`
2) `/docs/flutter_customer/go_live/release_gates.md`
3) `/docs/flutter_customer/go_live/staging_checks.md`
4) `/docs/flutter_customer/go_live/production_checks.md`
5) `/docs/flutter_customer/go_live/monitoring.md`
6) `/docs/flutter_customer/go_live/incidents.md`
7) `/docs/flutter_customer/go_live/rollback.md`
8) `/docs/flutter_customer/go_live/support_playbook.md`

---

## 3) Release gates (hard blockers)
In `release_gates.md`, define pass/fail gates:

### Must pass
- Deep links:
  - Android App Links open app in release build
  - iOS Universal Links open app in TestFlight build
  - Fallback to PWA when not installed
- Core journey:
  - Home → venue → menu → 4-tap order path works
- External payment handoff:
  - MoMo USSD (RW) launches
  - Revolut link (MT) opens
- No forbidden permissions requested
- Crash-free baseline in staging (define threshold)
- Abuse limits working (order spam + bell spam blocked)
- Venue/menu reads stable

### Nice-to-have
- perf baseline met
- A11y quick pass

---

## 4) Staging checks (pre-prod)
In `staging_checks.md`, include:
- build/version correctness (staging flavor)
- Supabase env points to staging project
- Edge Functions reachable and returning correct schema
- RLS expected behavior confirmed
- telemetry enabled for staging (optional)
- sample test venues exist in RW + MT
- deep link URLs tested on real devices

---

## 5) Production checks (cutover day)
In `production_checks.md`, include:
- prod build signed correctly
- assetlinks.json and AASA files published and correct for prod app IDs
- verify `/.well-known/assetlinks.json` and `/.well-known/apple-app-site-association` reachable
- sample QR URLs open app when installed
- fallback to PWA works when not installed
- Edge Functions deployed to prod and rate limits enabled
- confirm venue data availability and at least one real venue per country

---

## 6) Monitoring (first 72 hours plan)
In `monitoring.md`, specify:
- crash rate monitoring
- non-fatal error codes frequency
- order create success rate
- bell ring success rate
- rate-limit blocks (detect abuse or false positives)
- p95 latency for Edge Functions
- store review/watch notes

Define alert thresholds:
- crash spike
- order success drops
- function error spikes
- abnormal rate-limit blocks

---

## 7) Incident response
In `incidents.md`, define:
- severity levels (S1–S3)
- who does what
- communication templates (internal)
- common incidents:
  - deep links broken
  - order creation failing
  - bell ring spam
  - venue menu not loading
  - PWA fallback broken

Include quick triage steps:
- reproduce
- check logs
- roll back vs hotfix decision

---

## 8) Rollback procedure
In `rollback.md`:
- Play Store: halt rollout, revert to previous stable
- TestFlight/App Store: phased release / expedited review considerations
- backend rollback:
  - revert Edge Functions to last stable version
  - disable new flags (kill switches)
- post-rollback verification checklist

---

## 9) Support playbook (venue + customer)
In `support_playbook.md`:
- customer issues:
  - “Link doesn’t open app”
  - “Can’t place order”
  - “USSD didn’t open”
  - “Revolut didn’t open”
- venue issues:
  - “Bell not received”
  - “Orders not appearing”
  - “Menu not updated”
Provide:
- suggested troubleshooting steps
- what info to request (device, OS, venue slug, time)
- escalation path

No “AI” wording.

---

## 10) Acceptance criteria (measurable)
- runbook docs exist and are complete
- release gates are explicit and runnable
- staging/prod checks are step-by-step
- monitoring thresholds set
- rollback procedure is clear
- support playbook is usable by non-engineers
- /scope-guard passes

---

## 11) Verification evidence
Provide:
- files created (paths)
- summary of gates and thresholds
- example “Day-1 monitoring checklist”
- /scope-guard pass/fail

---

## 12) Output format (mandatory)
At end, output:
- Files created/changed (paths)
- Gate summary
- Monitoring summary
- Rollback summary
- /scope-guard pass/fail
