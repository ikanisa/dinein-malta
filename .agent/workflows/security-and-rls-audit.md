---
description: 
---

---
name: /security-and-rls-audit
description: Performs a systematic security audit for the DineIn monorepo: Supabase RLS verification, auth/role guards, public-read surfaces, secret handling, and abuse controls. Produces a prioritized fix list and implements critical fixes.
---

# /security-and-rls-audit (DineIn)

## 0) Scope (hard-locked)
This workflow is an AUDIT + FIX workflow.
It must NOT add product features (no maps, no payments APIs, no scanner, no delivery).
It focuses on:
- Supabase RLS correctness and performance
- auth and role gating across apps
- public access surface review
- secrets and env safety
- abuse controls (rate limits) for write endpoints

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Security + RLS audit"
Output must include:
- Scope lock + exclusions
- Plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Audit methodology (must follow)
### 2.1 Inventory the surfaces
Create an inventory table listing:
- routes (public/auth/owner/admin)
- DB tables (public read/write)
- Edge Functions / server actions
- storage buckets
- any third-party endpoints

### 2.2 Threat model (practical)
For each surface, consider:
- unauthorized read
- unauthorized write
- privilege escalation
- data tampering (orders/status)
- spam/abuse (bell calls, orders, claims)
- leakage of secrets via client bundle

---

## 3) Supabase RLS audit (table-by-table)
For each table with RLS enabled, verify:

### 3.1 Public read tables
- venues (Active only)
- active menus/categories/items
- promotions (active only)

Confirm:
- no sensitive columns leak (e.g., owner_user_id may be ok; admin flags not ok)
- disabled venues are not readable by anonymous users

### 3.2 Authenticated user tables
- profiles
- orders (user-owned reads)
- venue_claims (user can see own claims)

Confirm:
- users can update only their profile safe fields
- users cannot set is_admin or is_disabled
- orders create is constrained (no status injection beyond Placed)
- user cannot write orders to other venues if you restrict it (optional)

### 3.3 Owner tables
- venues update (owner only, limited columns)
- menu CRUD (owner only for own venue)
- orders status update (owner only for own venue)
- bell_calls ack/clear (owner only)

Confirm:
- ownership check is correct and indexed
- owners cannot change country_id, owner_user_id
- owners cannot set status outside allowed enum

### 3.4 Admin tables
- venue_claims approval
- ownership reassignment
- user disabling
- audit events write

Confirm:
- admin role check cannot be forged by client
- admin writes are logged

---

## 4) RLS performance audit
Check common pitfalls:
- missing indexes on columns used in policies (owner_user_id, venue_id, user_id)
- policies using slow subqueries without indexes
- broad SELECT policies that scan large tables

Deliver:
- index recommendations
- policy simplifications

---

## 5) Auth guard audit (front-end + server)
### 5.1 Front-end route gating
Verify:
- venue portal edit routes redirect if not owner
- admin portal routes redirect if not admin

But remember:
- front-end gating is not security; RLS is.
Ensure the server-side is secure even if UI is bypassed.

### 5.2 Server actions / Edge Functions
Verify:
- service role keys never shipped to client
- OCR worker endpoints require owner/admin and validate input
- telemetry ingest rate limited and schema validated (if enabled)

---

## 6) Storage bucket audit
If using Supabase storage:
- menu_uploads bucket:
  - deny public read unless absolutely required
  - allow owner read/write only for their venue folder
- ensure signed URLs used if client must preview
- verify no directory traversal patterns

---

## 7) Abuse controls (minimum viable)
Add or verify:
- rate limiting for:
  - bell call creation
  - order creation
  - claim submission
  - OCR job creation
- basic spam protections:
  - per venue per session limits
  - cooldown windows

Rules:
- do not introduce captchas unless asked
- keep user friction minimal

---

## 8) Secrets & build artifact audit
Verify:
- no secrets in client bundle
- no `.env` printed
- no keys committed
- env matrix doc exists with placeholders only

---

## 9) Output deliverables
### 9.1 Report (must create)
Create `/docs/security-audit.md` with:
- inventory table
- findings (severity: Critical/High/Medium/Low)
- exact evidence (file paths, policy snippets)
- recommended fix per finding
- what was fixed in this run

### 9.2 Fix plan and implementation
Implement:
- all Critical fixes immediately
- High fixes if small
- Otherwise create tickets/tasks

---

## 10) Acceptance criteria (measurable)
- Anonymous users cannot write any protected tables
- Non-owner cannot update venue/menu/orders/bell
- Non-admin cannot approve claims or reassign owner
- RLS policies are correct and indexed
- Storage access is correctly restricted
- Rate limiting exists for key abuse endpoints
- Audit report exists with prioritized findings

---

## 11) Verification evidence
Provide:
- RLS test results (positive + negative)
- list of indexes added
- screenshots of blocked access (optional)
- commands run
- summary of fixed issues

---

## 12) Output format (mandatory)
At end, output:
- Audit summary (Critical/High/Med/Low counts)
- Files changed (paths)
- Policies changed (tables)
- Indexes added
- Tests run (commands + results)
- Remaining risks + next actions
- /scope-guard pass/fail
