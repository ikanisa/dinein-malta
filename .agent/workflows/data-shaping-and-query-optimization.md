---
description: 
---

---
name: /data-shaping-and-query-optimization
description: Optimizes Supabase data access patterns for speed and simplicity: menu read shapes, venue discovery queries, order queries, and RLS-safe performance. Produces a query contract and refactors apps to use it.
---

# /data-shaping-and-query-optimization (DineIn)

## 0) Scope (hard-locked)
This workflow optimizes reads/writes and reduces payloads.
Must NOT add product features or expand scope:
- no maps/location
- no payment verification/APIs
- no scanner UI
- no delivery

Must preserve:
- /v/{slug} entry -> menu
- 2-tab customer nav
- order statuses: Placed/Received/Served/Cancelled

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Data shaping + query optimization"
Output must include:
- Scope lock + exclusions
- Plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Define the Query Contract (single source of truth)
Create `packages/db/queryContract.md` describing:

### 2.1 Public read endpoints (customer)
A) Venue by slug
- inputs: slug
- returns: venue (id, name, country, payment handles, status)

B) Active menu for venue
Return one nested shape (optimized for menu screen):
- categories sorted
- items sorted and filtered by available=true
- minimal fields only (no unused columns)

C) Venue discovery list (Home)
- filter by activeCountry
- pagination
- optional search term
- returns minimal card fields

D) Promotions by country/venue
- filter active only

### 2.2 Auth reads
E) Customer order history
- filter by user_id
- limit + pagination

F) Venue orders queue
- filter by venue_id and status (tabs)
- sort by created_at desc
- returns minimal list fields + count

G) Bell calls queue
- filter venue_id and status
- returns recent calls first

### 2.3 Admin reads
H) Claims list (Pending)
- filter status=Pending
- include venue preview and claimant profile minimal fields

I) Audit logs
- filter by date/action/entity
- pagination

Rules:
- All query functions must have deterministic parameters and return typed data.
- Avoid “select *”.
- Minimize nested joins unless needed.

---

## 3) Menu read optimization (critical path)
### 3.1 Ideal shape for /v/{slug}
Goal: one or two fetches max.

Option A (preferred): 2 queries
1) getVenueBySlug(slug)
2) getActiveMenuByVenueId(venueId) returning nested categories->items

Option B: single RPC
- Supabase SQL function returns full menu shape in one call
- useful if joins are heavy and you want server-side sorting

Choose simplest that meets performance.

### 3.2 Caching friendliness
- Menu read is GET-like; can be cached in service worker (from PWA slice).
- Ensure query params are stable for caching.

---

## 4) RLS-safe performance
For each query:
- confirm indexes exist on filter columns
- avoid policy subqueries that force sequential scans
- keep joins bounded

Add or adjust indexes if needed.

---

## 5) Reduce payload + UI re-renders
### 5.1 Field trimming
Ensure each query returns only what the UI renders.
Example: menu items should not return OCR staging fields.

### 5.2 Client memoization
- normalize menu data into stable references
- ensure category chips don’t re-render on cart change if unnecessary

---

## 6) Write operations shaping (orders + status updates)
### 6.1 Create order
Use a single server action/RPC if possible:
- creates order + items in one transaction
- returns created order id + status

### 6.2 Update status
- update orders.status only
- enforce allowed transitions (optional but recommended):
  - Placed -> Received -> Served
  - Placed -> Cancelled
  - Received -> Cancelled (optional)
No other transitions.

---

## 7) Implementation sequence (in order)
1) Inventory current queries in apps (customer/venue/admin)
2) Create packages/db query contract + typed functions
3) Refactor customer:
   - /v/{slug} to use query contract
   - Home discovery to use contract + pagination
4) Refactor venue:
   - orders queue queries + bell calls
5) Refactor admin:
   - claims and logs
6) Add missing indexes and adjust RLS if needed
7) Add tests for query functions (mocked)
8) Run /scope-guard

---

## 8) Acceptance criteria (measurable)
- /v/{slug} menu loads with ≤2 network calls (or 1 RPC) in normal case
- Payload sizes reduced (show before/after if possible)
- No query uses select *
- Home discovery is paginated
- Orders queue is paginated and filtered by status
- Queries remain RLS-safe
- No functional scope changes

---

## 9) Verification evidence
Provide:
- list of network calls for /v/{slug}
- before/after payload samples (sanitized)
- DB indexes added
- tests run
- screenshots showing no UI regression

---

## 10) Output format (mandatory)
At end, output:
- Files created/changed (paths)
- Query contract summary (functions list)
- Index changes
- Demo steps
- Tests run (commands + results)
- Known gaps + next workflow recommendation
- /scope-guard pass/fail
