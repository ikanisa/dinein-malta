---
description: 
---

---
name: /realtime-block-updates
description: Implements realtime updates for curated blocks on Customer Home and Venue Menu using Supabase Realtime. Adds smooth UI refresh rules, anti-jitter safeguards, and offline-friendly stale-while-revalidate behavior.
---

# /realtime-block-updates (DineIn)

## 0) Scope lock (non-negotiable)
This workflow implements:
- client subscriptions to curation_blocks
- smooth refresh behavior (no layout jitter)
- stale-while-revalidate fallback
- offline resilience

It must NOT:
- add chat UI
- mention “AI” in UI copy
- change journeys (ordering ≤ 4 taps remains)
- add maps/location, payment APIs/verification, scanning, delivery

Preserve:
- fixed slots layout on Home and Venue Menu
- minimal UI

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Realtime block updates"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Realtime model (what we subscribe to)
We subscribe to changes on `curation_blocks` rows keyed by:
- HOME: (surface=HOME, country, segment, variant)
- VENUE_MENU: (surface=VENUE_MENU, venue_id, segment, variant)

Client must only subscribe to **one row per surface** at a time (avoid noise).

---

## 3) Client-side data strategy (stale-while-revalidate)
Implement in `packages/core/curation/client/`:

### 3.1 Read flow
1) Load cached blocks from local storage / indexedDB (if present)
2) Render immediately (stale OK)
3) Fetch latest via GET /curation/...
4) Subscribe to realtime updates:
   - when update arrives:
     - validate shape
     - apply with smooth transition (no full rerender thrash)
     - update local cache

### 3.2 Cache key
Use the same key composition as server:
- surface + country/venue + segment + variant

Cache TTL:
- respect expires_at
- if expired but offline: keep last blocks with “soft stale” behavior (no warnings needed)

---

## 4) Anti-jitter safeguards (critical)
Realtime updates can cause “moving UI” which feels bad. Enforce:

### 4.1 Stable slot heights
- Each slot reserves a minimum height using skeletons
- Do not collapse/expand entire sections abruptly

### 4.2 Diff-and-patch updates
When blocks update:
- compare old vs new by block.id
- update only changed blocks
- preserve scroll position and focus

### 4.3 Update throttling
- if multiple updates in < 3s, apply only the latest
- ignore updates that don’t change meaningful content (hash compare)

### 4.4 Transition rules
- use subtle fade (respect reduced motion)
- never animate layout jumps

---

## 5) Subscription lifecycle
- Subscribe on screen mount
- Unsubscribe on unmount
- On country/segment change:
  - unsubscribe old
  - subscribe new
- On app background:
  - pause subscription (optional)
- On resume:
  - refresh once

---

## 6) Security/RLS check (must verify)
Ensure realtime subscriptions do not leak:
- only rows readable under RLS can be subscribed to
- segment is not a secret; still do not expose taste features
- blocks must contain only public render content

---

## 7) Failure modes & fallbacks
If realtime fails:
- continue polling on focus or every N minutes
- keep last known blocks

If block validation fails:
- ignore update and log client error (non-fatal)

If curation endpoint fails:
- show baseline “Browse venues” and keep existing blocks if any

---

## 8) Testing & verification
Unit tests:
- cache key composition
- diff-and-patch logic
- throttling behavior
- validation rejects unknown block types

Integration test:
- simulate realtime update event -> UI updates block content without changing scroll offset (best effort)

Manual QA:
- open Home, wait for update, ensure no jump
- open Venue Menu, scroll mid-list, update arrives, scroll position preserved

---

## 9) Acceptance criteria (measurable)
- Home and Venue Menu update curated blocks via realtime without jitter
- Cached blocks show instantly on repeat visits
- Offline: blocks still render from cache
- Subscription lifecycle is clean (no duplicates)
- No forbidden UI words (“AI”, etc.) appear
- Ordering flow unchanged and still ≤ 4 taps

---

## 10) Verification evidence
Provide:
- files changed (paths)
- video/gif optional showing smooth update
- screenshots before/after update
- tests run (commands + results)
- /scope-guard pass/fail

---

## 11) Output format (mandatory)
At end, output:
- Files changed (paths)
- Subscription keys strategy
- Cache approach
- QA notes (scroll stability)
- Tests run
- /scope-guard pass/fail
- Next workflow recommendation: /safety-and-copy-guard
