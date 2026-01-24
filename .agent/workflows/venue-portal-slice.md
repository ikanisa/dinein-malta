---
description: 
---

---
name: /venue-portal-slice
description: Builds the venue portal slice end-to-end: claim venue -> admin pending -> login -> view/edit venue -> menu upload+OCR staging -> share/QR generator -> orders queue -> bell inbox. Mobile-first.
---

# /venue-portal-slice

## 0) Scope (hard-locked)
This workflow builds ONLY Venue Portal capabilities, gated by auth/ownership.
Must NOT introduce:
- delivery, maps, geolocation, payment APIs/verification, in-app QR scanning.

Order statuses allowed:
- Placed, Received, Served, Cancelled

Entry rules remain:
- Customer deep link: /v/{venueSlug} (no scanner UI)

Venue edit rules:
- Venue pages are public view-only unless authenticated as owner.

---

## 1) Preconditions
- apps/venue exists (mobile-first PWA)
- Shared packages exist:
  - packages/ui, packages/core, packages/db
- Supabase tables exist OR provide mock adapters that match final shapes.

If missing, create the smallest scaffolding needed and STOP for review.

---

## 2) Kickoff (mandatory)
Run: /kickoff with scope: "Venue Portal slice"

Output must include:
- Scope lock + exclusions
- Plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 3) /ui-spec (mandatory)
Run: /ui-spec for venue portal with these screens:

A) Venue login (email + 4-digit password)
- Route: /login
- Minimal: email, 4-digit pin, submit
- Error states: wrong credentials, locked, network

B) Claim venue onboarding (from customer Settings CTA)
- Route: /claim
- Step 1: enter email + 4-digit pin (create/attach credential)
- Step 2: Smart search venue from DB (semantic-ish; start with fuzzy)
- Step 3: Submit claim
- Output: "Pending admin approval" screen

C) Pending state
- Route: /claim/pending
- Shows claim status and what happens next
- No edit controls

D) Venue dashboard (owner only)
- Route: /dashboard
- Widgets: New orders count, Bell calls, Menu status, Promos count
- Quick actions: Orders, Bell, Menu, Share/QR, Edit profile

E) Edit venue profile (owner only)
- Route: /venue/edit
- Fields:
  - WhatsApp number
  - Amenities (multi-select)
  - Specialities (multi-select)
  - About (short)
- Country is read-only (derived from venue)
- Save with optimistic UI + toasts

F) Payment handles (owner only)
- Route: /venue/payment
- If country=RW: enable MoMo code input
- If country=MT: enable Revolut link/handle input
- Disable irrelevant option (hard-gated)
- Save

G) Share & QR generator (owner only)
- Route: /venue/share
- Must generate:
  1) Venue URL (copy/share)
  2) Venue QR (download)
  3) Table QR variants (?t=)
  4) MoMo QR (RW only, enabled only after momoCode saved)
  5) Revolut QR (MT only, enabled only after revolutLink saved)
  6) Universal app URL share (root link)
- Provide download as PNG/SVG + a “Print layout” simple template

H) Menu manager (owner only)
- Route: /menu
- View categories/items
- Add/edit item (minimal form)
- Toggle available
- NO photos required

I) Menu upload + OCR staging (owner only)
- Route: /menu/upload
- Upload PDF/image -> creates ingest job
- Show job status + preview of extracted items in staging
- Approve/publish -> becomes active menu
- IMPORTANT: never auto-publish raw OCR output

J) Orders queue (owner only)
- Route: /orders
- Tabs: New (Placed) / Received / Served / Cancelled
- Order detail: table, items, notes, pay method
- Actions: mark Received, mark Served, Cancel

K) Bell inbox (owner only)
- Route: /bell
- List of calls (table no, time, note)
- Actions: Acknowledge / Clear
- Must support haptic/beep via UI notification patterns (no device permission prompts; just in-app sound/vibration if available and permitted by browser)

---

## 4) Data model (minimum viable)
Implement or stub these entities:

- Venue: { id, slug, name, country (RW|MT), ownerUserId?, whatsapp?, momoCode?, revolutLink?, amenities[], specialities[] }
- VenueClaim: { id, venueId, userId, status: Pending|Approved|Rejected, submittedAt }
- Menu: { id, venueId, activeVersionId? }
- MenuItem/Category: same as customer
- MenuIngestJob: { id, venueId, status: Pending|Running|NeedsReview|Published|Failed, fileUrl?, createdAt }
- MenuItemStaging: { jobId, name, price, categoryName, notes?, confidence? }
- Order: { id, venueId, tableNo?, status, payMethod, total, createdAt }
- BellCall: { id, venueId, tableNo, note?, status: New|Ack|Cleared, createdAt }

If backend not ready:
- Use mock adapter functions in packages/db with identical signatures to final Supabase calls.

---

## 5) Auth & Authorization (must be strict)
- Venue edit, menu edits, orders updates, QR generation pages require:
  - authenticated user AND
  - verified owner of venue (via ownership table/claim approval)
- Claim submission allowed for any authenticated “customer-default” user.
- If venue is already owned/approved:
  - Claim button must be disabled and UI must clearly state “Already claimed”.

RLS requirement:
- If using Supabase, implement RLS policies that enforce the above.
- Add at least one negative test (non-owner cannot update venue/menu/orders).

---

## 6) “Smart search” for claiming venues (practical version)
Phase 1 (required):
- Fuzzy search by name using DB query with ranking (prefix > contains > fuzzy)
- Keyboard-first results list
- Empty state suggests adjusting query

Phase 2 (optional, later):
- semantic embeddings search

Do not block the workflow on embeddings.

---

## 7) QR generation rules (important)
QR types:
1) Venue QR: encodes https://app.../v/{slug}
2) Table QR: encodes https://app.../v/{slug}?t={tableNo}
3) MoMo QR (RW only): enabled only when momoCode exists
4) Revolut QR (MT only): enabled only when revolutLink exists
5) Universal app QR (optional): https://app.../ (not required but allowed)

Downloads:
- PNG + SVG
- Provide print layout view (simple A6/table-stand template)

No images/photos required—QR + typography only.

---

## 8) Implementation sequence (vertical slice)
Implement in this exact order:

1) Claim flow (/claim -> search -> submit -> pending)
2) Admin hook placeholder:
   - For now: simulate approval via admin update OR feature flag
   - Real admin approval comes in admin workflow later
3) Login (/login) and owner gating middleware
4) Dashboard widgets + navigation
5) Edit venue profile + payment handles
6) Share & QR generator
7) Menu manager (view/edit/toggle availability)
8) Menu upload -> ingest job -> staging -> approve/publish
   - OCR integration can be stubbed; must support staging review UX
9) Orders queue + status updates
10) Bell inbox + acknowledge/clear
11) Run /scope-guard and fix violations

After each step: provide demo route and verify on mobile viewport.

---

## 9) Verification (required evidence)
Manual checks:
- Non-owner cannot access edit screens (redirect + message)
- Claim flow works; already-claimed venue cannot be re-claimed
- RW venue shows MoMo fields/QR; MT venue shows Revolut fields/QR
- Venue QR downloads correctly; table QR variants work (?t=)
- Menu upload creates job; staging appears; publish makes menu active
- Orders can be marked Received/Served/Cancelled
- Bell calls appear and can be acknowledged/cleared

Automated tests (minimum):
- Unit: venue claim state machine (Pending/Approved/Rejected)
- Integration: ownership guard logic
- E2E: owner login -> edit venue -> generate QR -> update order status

Evidence to produce:
- commands run
- test output
- screenshots: dashboard, share/QR, orders queue, bell inbox

---

## 10) Output format (mandatory)
At end, output:
- Files changed (paths)
- Demo steps (exact routes)
- Tests run (commands + result)
- Known gaps + next slice recommendation
- /scope-guard pass/fail checklist

