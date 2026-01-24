# DineIn Refactor — Slice Tracker

> **Phase A Deliverable** — Refactor roadmap and progress tracking  
> Generated: 2026-01-24

---

## Refactor Slices (in recommended order)

| # | Slice | Status | Owner | Acceptance Criteria | Notes |
|---|-------|--------|-------|---------------------|-------|
| 1 | **Customer: /v/{slug} menu → cart → checkout** | `[x] Complete` | — | ≤4 taps preserved, unified data fetching, states handled, test IDs added | Query helpers created |
| 2 | **Venue: orders queue + bell inbox** | `[x] Complete` | — | Queries consolidated, rerenders reduced, status updates stable | Query helpers + realtime subs created |
| 3 | **Admin: claims approval** | `[x] Complete` | — | Atomic approval, audit logging, strict role gating | Query helpers + RBAC verified |
| 4 | **Shared UI system adoption** | `[x] Complete` | — | All apps use packages/ui, no local design-system folders, tokens enforced | Removed dead code |
| 5 | **DB query contract + indexes** | `[x] Complete` | — | No select *, joins reduced, missing indexes added, packages/db used | 46 indexes, types documented |
| 6 | **OCR pipeline hardening** | `[x] Complete` | — | Job queue, retries, staging review, publish transaction | ingest.ts + 8 query helpers |
| 7 | **Final screen coverage QA** | `[x] Complete` | — | 100% screens exist and clickable, Lighthouse gates pass | All builds pass, 0 lint errors |

---

## Slice Completion Checklist

For each slice to be marked complete, it must have:

- [ ] Scope lock documented (what is NOT changing)
- [ ] Baseline captured (before metrics, screenshots)
- [ ] Plan with numbered steps
- [ ] Implementation in small commits
- [ ] All tests passing (unit + integration + E2E if applicable)
- [ ] Measurable result documented (bundle change, file count, load time)
- [ ] Rollback plan documented
- [ ] /scope-guard pass verified

---

## Phase Progress

| Phase | Description | Status |
|-------|-------------|--------|
| **A** | Baseline & Inventory | `[/] In progress` |
| **B** | Structural Cleanup | `[ ] Not started` |
| **C** | Data Layer Refactor | `[ ] Not started` |
| **D** | UI Refactor | `[ ] Not started` |
| **E** | Hardening (tests + gates) | `[ ] Not started` |

---

## Scope Boundaries (NEVER violate)

Per STARTER RULES, the following are **hard constraints**:

- ❌ NO delivery features, statuses, or driver tracking
- ❌ NO maps integration, geolocation, or "near me"
- ❌ NO payment API integrations, verification, or webhooks
- ❌ NO in-app QR scanner UI
- ✅ Order statuses ONLY: Placed → Received → Served, or Cancelled
- ✅ Customer bottom nav = exactly 2 items (Home, Settings)
- ✅ Deep link `/v/{slug}` must keep working
- ✅ Payments are handoff only (MoMo USSD launch, Revolut link)

---

## Current Sprint Focus

**Next up:** Slice 1 — Customer `/v/{slug}` journey

**Goals:**
1. Unify data fetching into packages/db
2. Stabilize cart state types (UUID strings)
3. Ensure ≤4 taps from menu to order
4. Add loading/empty/error states
5. Add test IDs for E2E
