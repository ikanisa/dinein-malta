---
description: 
---

---
name: /admin-portal-slice
description: Builds the admin portal slice end-to-end: admin auth -> venue claims review -> approve/deny -> assign ownership -> venue/menu/user management -> audit logs. Mobile-first.
---

# /admin-portal-slice

## 0) Scope (hard-locked)
This workflow builds ONLY the Admin Portal capabilities.

Must NOT introduce:
- delivery features, maps/geolocation, payment APIs/verification, in-app QR scanning, or extra order statuses.

Order statuses allowed:
- Placed, Received, Served, Cancelled

Admin scope focus:
- Approvals, ownership assignment, moderation, audit.

---

## 1) Preconditions
- apps/admin exists (mobile-first PWA)
- Shared packages exist:
  - packages/ui, packages/core, packages/db
- Venue claim flow exists (from venue portal workflow) OR at minimum the schema is present.

If missing, create the smallest scaffolding needed and STOP for review.

---

## 2) Kickoff (mandatory)
Run: /kickoff with scope: "Admin Portal slice"

Output must include:
- Scope lock + exclusions
- Plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 3) /ui-spec (mandatory)
Run: /ui-spec for admin portal with these screens:

A) Admin login
- Route: /admin/login
- Minimal: email + password (or whatever admin auth mechanism is chosen)
- Strong error states; lockout messaging if needed

B) Admin dashboard
- Route: /admin
- Widgets:
  - Pending claims count
  - Venues pending review
  - OCR jobs failing
  - Recent audit events
- Quick actions:
  - Claims
  - Venues
  - Menus
  - Users
  - Logs

C) Claims review
- Route: /admin/claims
- List: Pending claims only by default
- Filters: Pending/Approved/Rejected, Country
- Claim detail:
  - venue info preview
  - claimant info (minimal)
  - actions: Approve, Reject

D) Ownership assignment (on Approve)
- Must assign venue.owner_user_id (or equivalent) atomically with approval
- If venue already has owner:
  - block approval with clear reason
  - provide “reassign owner” tool (guarded)

E) Venue management
- Route: /admin/venues
- Actions:
  - edit venue name/slug (careful), disable venue, set country (rare)
  - view owner, reassign owner (guarded)
  - view payment handle fields (read-only by default)

F) Menu management (audit)
- Route: /admin/menus
- View menu versions, active menu, item counts
- Review OCR staging jobs:
  - view extracted items
  - mark job as needs-fix / re-run / approve publish (admin override)
- No photos required

G) User management (minimal)
- Route: /admin/users
- Search by email/whatsapp/name
- Actions:
  - disable user (soft)
  - view roles/ownerships

H) System logs (audit trail)
- Route: /admin/logs
- Filter by:
  - actor (admin id)
  - entity (venue/order/menu/claim)
  - date range
- Show event details in a bottom sheet (mobile-friendly)

---

## 4) Data model (minimum viable)
Admin relies on these entities:

- Profiles/User: { id, email?, whatsapp?, isDisabled? }
- Venues: { id, slug, name, country, status, ownerUserId?, momoCode?, revolutLink? }
- VenueClaims: { id, venueId, userId, status: Pending|Approved|Rejected, submittedAt, reviewedAt?, reviewedBy? }
- MenuIngestJobs: { id, venueId, status, createdAt }
- MenuItemStaging: { jobId, ... }
- AuditEvents: { id, actorId, action, entityType, entityId, metadata, createdAt }

If backend not ready:
- Provide mock adapters with identical signatures.

---

## 5) Admin authorization (must be strict)
- Only admins can access apps/admin routes.
- Admin role determination must be explicit and centralized:
  - profile.is_admin flag OR
  - separate admins table
- Never infer admin by email domain alone.

RLS requirement (if Supabase):
- Enforce admin-only access for claims approval, ownership changes, moderation actions.
- Add negative tests: non-admin cannot approve claim or reassign owner.

---

## 6) Transaction rules (avoid inconsistent ownership)
Approving a claim must do ALL of this atomically:
1) Verify claim is still Pending
2) Verify venue has no owner (unless explicitly reassigning)
3) Set claim status = Approved with reviewer metadata
4) Set venue owner = claimant userId
5) Write an audit event

Rejecting a claim:
1) claim status = Rejected with reviewer metadata
2) Write an audit event

Reassign owner (guarded):
1) Requires explicit confirmation UI step (one extra tap allowed here)
2) Writes audit event with previous owner id + new owner id

---

## 7) Audit logging (mandatory)
Every admin action must create an AuditEvent:
- Approve claim
- Reject claim
- Reassign owner
- Disable venue
- Disable user
- Override publish menu / OCR job actions

Audit event structure:
- actorId (admin)
- action (string enum)
- entityType, entityId
- metadata JSON (minimal, no secrets)
- createdAt

---

## 8) Implementation sequence (vertical slice)
Implement in this exact order:

1) Admin auth gating (middleware/guard)
2) Claims list + claim detail view
3) Approve/Reject with atomic updates + audit events
4) Venue management list + venue detail + disable venue
5) Owner reassign tool (guarded) + audit
6) Menu management + OCR jobs overview + admin overrides (optional in v1)
7) User management minimal (disable user) + audit
8) Logs viewer (filter + detail)
9) Run /scope-guard and fix any violations

After each step: provide demo routes and verify on mobile viewport.

---

## 9) Verification (required evidence)
Manual checks:
- Non-admin cannot access admin routes
- Admin can approve a pending claim -> venue owner is assigned
- Already-owned venue cannot be approved for a new claim (blocked)
- Reject claim works and is reflected in claim status
- Reassign owner writes audit event and updates venue owner
- Disabling a venue hides it from customer discovery (or marks inactive)
- Logs show all admin actions with correct metadata

Automated tests (minimum):
- Unit: claim approval transaction builder + validation
- Integration: admin authorization guard
- E2E: approve claim -> venue becomes editable by claimant in venue portal

Evidence to produce:
- commands run
- test output
- screenshots: claims list/detail, approve action result, logs screen

---

## 10) Output format (mandatory)
At end, output:
- Files changed (paths)
- Demo steps (exact routes)
- Tests run (commands + result)
- Known gaps + next slice recommendation
- /scope-guard pass/fail checklist
