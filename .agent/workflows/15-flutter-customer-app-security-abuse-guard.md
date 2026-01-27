---
description: 
---

---
name: /flutter-customer-app-security-abuse-guard
description: Secures the no-login customer Flutter app against abuse: rate limiting, order spam prevention, bell ring throttling, payload validation, and observability. Uses Edge Functions as a write gateway and keeps RLS tight.
---

# /flutter-customer-app-security-abuse-guard (No-Auth Hardening)

## 0) Scope lock (non-negotiable)
This workflow implements:
- abuse prevention for anonymous sessions
- strict validation for orders and bell rings
- rate limits per session_id + IP hints (where available)
- bot mitigation basics
- audit logging for write endpoints

It must NOT:
- add login/signup
- add payment verification APIs
- add maps/location
- degrade customer UX with captchas unless truly needed

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "No-auth security + abuse guard"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Threat model (must document)
Create `/docs/flutter_customer/security/threat_model.md`:
- order spam (fake orders)
- bell spam (harassing venue)
- menu scraping (mass download)
- replay attacks (repeat same payload)
- high-frequency requests causing cost spikes

Include:
- what we’re protecting
- likelihood and impact
- mitigations

---

## 3) Edge Functions as the write gate (required)
Ensure orders and bell ring go through Edge Functions:
- create_customer_order
- ring_bell
- (optional) get_order_status

Hard rule:
- service role key never ships to client

---

## 4) Rate limiting strategy (must implement)
Create `/docs/flutter_customer/security/rate_limits.md` with defaults:

### 4.1 Orders
- max 3 orders / 5 minutes / session_id / venue_id
- max 10 orders / day / session_id (soft limit)
- enforce minimum interval between orders (e.g., 20–30 seconds)

### 4.2 Bell ring
- max 2 rings / 1 minute / session_id / venue_id
- max 10 rings / hour / session_id / venue_id
- enforce cooldown (e.g., 20 seconds)

### 4.3 Menu reads (if needed)
If you see scraping:
- add a simple server-side read endpoint with throttle
Otherwise keep reads direct with caching.

Implementation notes:
- store counters in a lightweight table (or KV) keyed by session_id+venue_id+window
- expire windows automatically

---

## 5) Payload validation (strict)
For create_customer_order:
- venue_id must exist and be active
- items must belong to venue
- qty bounds (1..10 per item, max items 20)
- prices can be server-derived (ignore client price)
- payment_method must match venue.country:
  - RW: cash or momo_ussd
  - MT: cash or revolut_link
- table_number optional but if present:
  - numeric, sane range (1..999)

For ring_bell:
- venue_id exists
- table_number required, numeric, sane range
- apply rate limits before insert

Return safe errors:
- “Too many requests, try again in a moment.”
- “Invalid table number.”
- “Venue not available.”

No internal details.

---

## 6) Replay prevention (optional but recommended)
Add idempotency key:
- client sends request_id (UUID)
- server stores request_id for short TTL
- duplicate request_id returns same order_id (no double orders)

Document in:
- /docs/flutter_customer/security/idempotency.md

---

## 7) Audit logging (must implement)
Create a log table:
- endpoint
- session_id hash (not raw)
- venue_id
- outcome (ok/blocked/invalid)
- reason code
- latency_ms
- created_at

This lets you detect attacks quickly.

---

## 8) RLS tightening (required)
- prevent direct client inserts into orders/bell tables
- allow only Edge Functions (service role) to write
- if you allow status reads:
  - restrict to session_id token model or function-based access
  - do not expose all orders publicly

Document in:
- /docs/flutter_customer/security/rls_summary.md

---

## 9) Client-side “polite throttles” (UX-friendly)
In Flutter:
- disable “Place order” button after tap until response
- disable “Ring” button during cooldown timer
- show countdown microcopy (subtle)

This reduces accidental double taps and helps the server.

---

## 10) Monitoring & alerts
Add simple alert rules (even if manual initially):
- spike in blocked requests
- spike in order creates per venue
- spike in bell rings per venue
- Edge Function error rate

Document in:
- /docs/flutter_customer/security/monitoring.md

---

## 11) Testing & verification
- unit tests for validation helpers
- integration tests:
  - order spam attempt gets blocked
  - bell spam attempt gets blocked
  - invalid payload gets 4xx with safe message
  - idempotency returns same order

Manual:
- try rapid-tapping Place Order -> only one order created

---

## 12) Acceptance criteria (measurable)
- rate limits enforced server-side
- payload validation strict and safe
- direct client inserts blocked by RLS
- audit logs captured
- client UI prevents accidental spam
- /scope-guard passes

---

## 13) Verification evidence
Provide:
- files changed (paths)
- rate limit numbers
- sample audit log row (sanitized)
- tests run (commands + results)
- /scope-guard pass/fail

---

## 14) Output format (mandatory)
At end, output:
- Files changed (paths)
- Threat model summary
- Rate limits summary
- Next workflow recommendation: /flutter-customer-app-polish-microinteractions
- /scope-guard pass/fail
