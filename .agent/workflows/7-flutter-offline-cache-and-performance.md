---
description: 
---

---
name: /flutter-offline-cache-and-performance
description: Hardens the Flutter customer app for premium native performance: instant cold-start UX, aggressive caching for venues/menus, smooth scrolling, prefetching, reduced jank, and robust offline behavior.
---

# /flutter-offline-cache-and-performance (Customer Flutter App)

## 0) Scope lock (non-negotiable)
This workflow improves:
- cold start speed
- list/menu smoothness
- offline caching behavior
- prefetching and stale-while-revalidate

It must NOT:
- add new journeys/screens
- add login/signup
- add maps/location/payment APIs/delivery
- change the 4-tap order path

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Flutter offline cache + performance"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Startup strategy (critical)
Goal: show usable Home UI fast.

Implement:
- fast splash -> immediate Home shell
- show cached venues immediately (if available)
- load fresh venues in background

Avoid:
- blocking on network before rendering

Optional polish:
- flutter_native_splash (later) for brand-consistent startup
- keep it minimal; do not delay first frame

---

## 3) Cache hardening (venues + menus)
Ensure cache is structured and bounded.

### 3.1 Cache keys
- venues: country + cursor page
- venue-by-slug: slug
- menu: venue_id
- promos: country (+ venue_id optional)

### 3.2 TTL policy
- venues: 1–6 hours
- venue-by-slug: 6–24 hours
- menu: 10–60 minutes
- promos: 30–60 minutes

### 3.3 Size limits
- cap cached venues per country (e.g., 300)
- cap cached menus (e.g., 50 venues)
- evict LRU when exceeding caps

Document limits in:
- /docs/flutter_customer/cache_policy.md

---

## 4) Stale-while-revalidate UX (no flicker)
When fresh data arrives:
- update list with diffing
- keep scroll position
- avoid full list rebuild

Implementation tactics:
- stable item keys
- use selectors and memoized derived state
- do not re-create controllers on rebuild

---

## 5) Menu performance (large menus)
Menus can be big; enforce:
- ListView.builder with itemExtent estimation where possible
- avoid heavy widgets in each row
- precompute chips/tags styles
- no expensive blur per row (glass only on containers, not each tile)

If categories are many:
- lazy build category sections
- use SliverList/CustomScrollView if needed

---

## 6) Prefetch strategy (smart, minimal)
On Home:
- prefetch venue details/menu for:
  - the first venue card in view
  - the one user taps (priority)

On deep link /v/{slug}:
- fetch venue by slug
- fetch menu immediately after venue resolves
- show skeleton placeholder while fetching, but keep header visible

Avoid:
- prefetching too much on slow networks

---

## 7) Network resilience
Implement:
- retry with exponential backoff for transient failures
- timeout and fallback to cache
- clear user messaging:
  - “No connection” only when necessary
  - keep UI usable with cached data

Add:
- a small connectivity indicator (non-intrusive) if offline

---

## 8) Image policy (still text-first)
Keep images off by default.
If you add later:
- lazy load below fold
- cache thumbnails
- never block first render

---

## 9) Performance instrumentation (light)
Add internal metrics logging (dev):
- cold start time to first usable Home
- time to menu render
- list scroll jank samples (basic)

Document in:
- /docs/flutter_customer/perf_baseline.md

---

## 10) Testing & verification
Manual:
- airplane mode: Home shows cached venues
- open a cached venue menu offline: shows cached menu
- deep link offline:
  - if venue/menu cached: opens
  - else: shows NotFound + retry

Performance check:
- scroll Home list fast: no stutter
- scroll long menu list: stable 60fps on mid devices (best effort)

Automated:
- cache eviction tests
- repository stale-while-revalidate tests

---

## 11) Acceptance criteria (measurable)
- Home renders quickly with cached data when available
- Menus remain smooth even for large lists
- Cache has TTL + size caps + eviction
- Offline mode still supports browsing cached venues/menus
- No UI flicker/jitter when data refreshes
- /scope-guard passes

---

## 12) Verification evidence
Provide:
- files changed (paths)
- cache policy doc
- perf baseline doc (before/after notes)
- QA notes for offline + deep links
- tests run (commands + results)
- /scope-guard pass/fail

---

## 13) Output format (mandatory)
At end, output:
- Files changed (paths)
- Cache strategy summary
- Prefetch summary
- Offline behavior summary
- Next workflow recommendation: /flutter-analytics-crash-and-logs
- /scope-guard pass/fail
