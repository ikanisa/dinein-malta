---
description: 
---

---
name: /pwa-quality-slice
description: Hardens all three PWAs (customer/venue/admin) for world-class PWA quality: installability, caching, offline-tolerant browsing, performance budgets, and Lighthouse gates. Includes A2HS behavior rules.
---

# /pwa-quality-slice

## 0) Scope (hard-locked)
This workflow improves PWA quality without changing product scope.
Must NOT introduce:
- maps/geolocation
- payment APIs/verification
- in-app QR scanning
- delivery flows/statuses

Allowed:
- install prompt UX
- caching strategies
- offline-tolerant menu browsing (READ-only offline)
- performance optimizations
- Lighthouse improvements
- accessibility basics

---

## 1) Preconditions
- apps/customer, apps/venue, apps/admin exist and run
- Basic routing exists (including /v/{venueSlug})
- Supabase or mock adapter wired to apps
- packages/ui tokens exist

If any are missing, create the smallest scaffolding needed and STOP for review.

---

## 2) Kickoff (mandatory)
Run: /kickoff with scope: "PWA quality slice"
Output must include:
- Scope lock + exclusions
- Plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 3) PWA checklist (must implement per app)
Apply to customer, venue, admin (with app-specific manifests):

### 3.1 Manifest
Each app must have:
- name, short_name
- start_url (app root)
- display: standalone
- background_color + theme_color (aligned with design tokens)
- icons: at least 192 + 512 (maskable preferred)
- orientation: portrait (optional but recommended for dine-in)
- id (stable)

Rules:
- customer start_url should support deep links
- do not break /v/{slug} behavior

### 3.2 Service worker
- Enable service worker with runtime caching
- Do NOT cache POST/PUT/PATCH/DELETE
- Do NOT simulate offline ordering unless full conflict handling is built (out of scope)

### 3.3 Installability
- Must pass installability checks (https, manifest, service worker)
- Provide “Add to Home Screen” UX (A2HS) per rules below

---

## 4) Runtime caching strategy (safe + effective)
Implement caching that makes the app feel instant, without lying:

### 4.1 App shell / static assets
Strategy: StaleWhileRevalidate
- JS/CSS/fonts/icons
- Keep cache size bounded

### 4.2 Menu read APIs (GET only)
Strategy: NetworkFirst with timeout fallback to cache
- Menus/categories/items
- Venues list for Home
- Promotions

Goal:
- If network is flaky, user can still browse last-known menu.

### 4.3 Images
This product avoids images. Do not add image caching complexity.

### 4.4 Orders and writes
Strategy: NetworkOnly
- Creating orders
- Updating order statuses (venue)
- Claim actions
- Bell calls
If offline:
- show clear error message, allow retry

---

## 5) Add-to-Home-Screen (A2HS) policy (non-annoying)
Implement a shared A2HS controller in packages/core and UI in packages/ui.

### 5.1 Trigger conditions (customer app)
Show A2HS prompt ONLY if:
- not installed AND
- one of:
  - order placed successfully
  - cart reached 2+ items
  - user spent ~45s browsing menu
AND
- not dismissed within cooldown window (e.g., 7 days)

Never show:
- on first paint
- before the user interacts

### 5.2 iOS fallback
If iOS Safari where beforeinstallprompt isn’t available:
- Show a minimal instruction sheet:
  - Share icon -> Add to Home Screen
- One-tap dismiss; respect cooldown.

### 5.3 Settings fallback
Always include Settings -> “Add to Home Screen”
- opens the same prompt/instructions

---

## 6) Performance budgets (hard gates)
Define performance budgets and enforce them:

### 6.1 Bundle constraints
- No large dependencies without justification
- Avoid importing entire icon packs; tree-shake

### 6.2 Rendering constraints
- Menu lists: use virtualization when item count is high
- Avoid rerender storms:
  - keep cart state minimal
  - memoize heavy components

### 6.3 Network constraints
- Paginate venue discovery
- Avoid fetching full menus until venue page is opened

### 6.4 UX constraints
- Skeleton loading for all primary screens:
  - /v/{slug}
  - cart
  - checkout
  - orders list
  - venue dashboard
  - admin claims

---

## 7) Lighthouse gates (must pass)
Run Lighthouse for each app and record results.

Targets (mobile):
- Performance: ≥ 90 (or show plan to reach 90)
- Accessibility: ≥ 90
- Best Practices: ≥ 95
- SEO: ≥ 80 (for customer entry pages)
- PWA: passes installability + offline page handling

If a score is below target:
- produce a fix list with priority order
- implement highest-impact fixes first

---

## 8) Offline UX rules (truthful)
When offline:
- customer can browse cached menu + venue list (if previously loaded)
- customer cannot place an order:
  - show message: “You’re offline. Reconnect to place an order.”
  - provide retry
- venue cannot update orders:
  - show message: “Offline. Reconnect to update statuses.”

Provide a clean offline fallback page route.

---

## 9) Security & stability rules
- Do not cache sensitive user data (profiles, admin screens) unless required
- For admin/venue, keep caching conservative:
  - cache app shell only
  - avoid caching dynamic moderation data

---

## 10) Implementation sequence (apply in order)
1) Add/verify manifests for all apps
2) Add service worker + base caching for app shell
3) Add runtime caching for public GET endpoints (customer)
4) Add offline fallback page + truthful messaging
5) Implement A2HS controller + prompt UI + cooldown
6) Add performance improvements (virtualization, split bundles)
7) Run Lighthouse and fix major issues
8) Document PWA behavior in /docs/pwa-quality.md
9) Run /scope-guard (must pass)

After each step, provide:
- demo steps (routes)
- what changed (paths)
- proof (screenshots/Lighthouse report snippets)

---

## 11) Verification (required evidence)
Manual:
- Deep link /v/{slug} works installed and non-installed
- No permission prompts appear
- A2HS prompt appears only after engagement and respects cooldown
- Offline browsing works after at least one visit
- Offline ordering is blocked with clear message

Automated (minimum):
- Unit: A2HS cooldown logic
- Integration: caching config exported correctly
- E2E: deep link -> menu -> add items -> trigger A2HS -> dismiss -> ensure not shown again immediately

Evidence:
- Lighthouse reports per app
- list of caches and strategies used
- screenshots: A2HS prompt, offline message, installed standalone mode

---

## 12) Output format (mandatory)
At end, output:
- Files changed (paths)
- Caching strategies table (resource type -> strategy)
- Lighthouse scores (before/after if available)
- Demo steps
- Tests run (commands + results)
- Known gaps + next workflow recommendation
- /scope-guard pass/fail

