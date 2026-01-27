---
description: 
---

---
name: /flutter-analytics-crash-and-logs
description: Adds lightweight observability for the Flutter customer app: crash reporting, non-fatal error logging, and key funnel event tracking (open venue, add to cart, place order) without user accounts. Includes privacy rules and kill switches.
---

# /flutter-analytics-crash-and-logs (Customer Flutter App)

## 0) Scope lock (non-negotiable)
This workflow adds:
- crash reporting
- non-fatal error logging
- minimal funnel analytics
- privacy-safe identifiers (session_id only)

It must NOT:
- introduce signup/login
- add invasive tracking or PII collection
- add maps/location/payment APIs/delivery
- change user journeys or UI

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Flutter analytics + crash + logs"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Privacy policy constraints (must document)
Create `/docs/flutter_customer/telemetry_policy.md`:
- what we collect (session_id, event names, timestamps, venue_id, order_id)
- what we do NOT collect:
  - phone number by default
  - precise location
  - message content
  - payment confirmation
- retention (define reasonable retention)
- opt-out (optional toggle in Settings: “Share usage data”)

No UI wording about “AI”.

---

## 3) Crash reporting (choose ONE)
Option A (recommended): Sentry
- fast to set up, good Flutter support, release tracking
Option B: Firebase Crashlytics
- also standard, but adds Firebase stack

Pick one and document in:
- /docs/flutter_customer/telemetry_stack.md

Hard rule:
- keep dependencies minimal

---

## 4) Non-fatal error logging
Implement a single logger abstraction:
- apps/flutter_customer/lib/core/utils/logger.dart

Features:
- log levels
- breadcrumbs
- network error normalization (timeout, offline, server error)
- rate-limit repeated errors

Log examples:
- “supabase_read_failed”
- “order_create_failed”
- “deeplink_parse_failed”
- “cache_corrupt_recovered”

---

## 5) Analytics events (minimal funnel)
Implement:
- apps/flutter_customer/lib/core/telemetry/events.dart
- apps/flutter_customer/lib/core/telemetry/telemetry.dart

Events (suggested):
- app_open
- home_loaded
- venue_opened (venue_id, country)
- menu_loaded (venue_id)
- item_added_to_cart (venue_id, item_id)
- checkout_opened (venue_id)
- payment_handoff_clicked (method)
- order_placed (order_id, method)
- bell_rang (venue_id)

Rules:
- never log item names or user-entered notes
- only log IDs and counts

---

## 6) Session identity (no auth)
Use:
- session_id generated once and stored locally
- include session_id in telemetry events

If user toggles “Share usage data” off:
- stop sending telemetry
- keep local logs minimal

---

## 7) Kill switches (important)
Add env flags:
- TELEMETRY_ENABLED
- CRASH_REPORTING_ENABLED

Default:
- enabled in production
- disabled or limited in debug (your choice)

---

## 8) Testing & verification
Manual:
- simulate a crash in dev build -> verify it’s captured in your tool (dev project)
- trigger a non-fatal network error -> verify it logs as expected
- verify opt-out stops sending events

Automated:
- unit test for event payload sanitizer (no PII fields)
- unit test for rate-limited logging

---

## 9) Acceptance criteria (measurable)
- Crash reporting integrated and working in staging/prod builds
- Non-fatal errors are logged with normalized codes
- Key funnel events are tracked without PII
- Opt-out (if implemented) works
- Kill switches exist
- /scope-guard passes

---

## 10) Verification evidence
Provide:
- files changed (paths)
- telemetry policy doc
- event list + sample sanitized payload
- tests run (commands + results)
- /scope-guard pass/fail

---

## 11) Output format (mandatory)
At end, output:
- Files changed (paths)
- Telemetry stack choice
- Event list summary
- Next workflow recommendation: /flutter-release-android-ios
- /scope-guard pass/fail
