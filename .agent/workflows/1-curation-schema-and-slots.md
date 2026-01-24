---
description: 
---

---
name: /curation-schema-and-slots
description: Defines the curation block schema contract and implements fixed UI “slots” on Customer Home + Venue Menu that can be filled by server-generated curated blocks. No chat UI. No “AI” wording.
---

# /curation-schema-and-slots (DineIn)

## 0) Scope lock (non-negotiable)
This workflow creates:
- a strict curation block schema (render contract)
- DB table(s) to store blocks
- UI slot components on Customer Home and Venue Menu
- a baseline “non-ML” filler (deterministic ranking) to prove wiring

It must NOT:
- add chat UI
- mention “AI” in frontend copy
- add maps/location, payment APIs/verification, in-app scanning, delivery
- change journeys or exceed the 4-tap ordering constraint

Preserve:
- customer bottom nav = Home + Settings only
- deep link /v/{slug} opens menu and sets activeCountry from venue

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Curation schema + slots"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Define the Block Contract (single source of truth)
Create `packages/core/curation/schema.ts`:

### 2.1 Surfaces (where blocks appear)
- HOME
- VENUE_MENU
- CART_UPSELL (optional for later; can stub now)

### 2.2 Block types (fixed set)
- venue_list
- item_carousel
- upsell_row
- promo_strip
- category_highlights

### 2.3 Block shape (strict)
Each block:
- id: string (stable)
- surface: enum
- block_type: enum
- title_key: string (i18n key) OR title_text: string (short, max 40 chars)
- items: array of { id: string, badge?: string, subtitle?: string }
- cta?: { type: open_venue|open_item|open_cart, target_id?: string }
- priority: number (0..100)
- expires_at: ISO timestamp
- variant?: string (A/B variant id)
- meta?: { source: baseline|curation_service, country: RW|MT|unknown, venue_id?: string }

Hard limits enforced by validators:
- blocks per surface: max 4
- items per block:
  - venue_list: max 10
  - item_carousel: max 12
  - upsell_row: max 3
  - promo_strip: max 5
  - category_highlights: max 6
- no free-form long text; subtitle max 60 chars; badge max 16 chars
- all ids must exist in DB (validated server-side)

### 2.4 Frontend copy rules
Create `packages/core/curation/copyRules.md` and enforce:
- no “AI”, “assistant”, “powered by”, “machine learning”
- allowed labels: Smart Picks, Recommended, Popular here, Pairs well, Quick add-ons, Trending
- no allergy certainty (use “may contain” only if needed; otherwise avoid)

---

## 3) Storage model (Supabase)
Create migration(s):

### 3.1 curation_blocks table
Columns:
- id uuid pk
- surface text (enum-like)
- country text (RW|MT|unknown)
- venue_id uuid nullable
- segment text (e.g., new|returning|foodie|cocktails|budget|veg_friendly)
- blocks jsonb (array of blocks)
- variant text nullable
- expires_at timestamptz
- created_at timestamptz
- updated_at timestamptz

Indexes:
- (surface, country, venue_id, segment, expires_at desc)
- (updated_at desc)

RLS:
- Read:
  - customer app can read rows where:
    - surface=HOME and country matches activeCountry
    - surface=VENUE_MENU and venue_id matches
  - segment can be “anon_default” initially
- Write:
  - no direct client writes
  - only via server/edge function (service role)

### 3.2 Optional audit table (recommended)
curation_runs:
- id uuid
- surface
- venue_id
- country
- segment
- input_hash
- output_hash
- source (baseline|gemini)
- created_at

---

## 4) Baseline filler (no model yet)
Implement a server function (Edge Function or server action):
- `GET /curation/home?country=RW&segment=anon_default`
- `GET /curation/venue/:venueId?segment=anon_default`

Baseline logic:
- HOME: venues ordered by (featured/promos, popularity, recency)
- VENUE_MENU: blocks:
  - Popular here (top ordered items)
  - Quick add-ons (top 3 low-price items)
  - Category highlights (top categories by item count)

Rules:
- must not require personalization
- must not increase taps
- must be fast and cached (5–15 min)

Write results into curation_blocks (upsert by key).

---

## 5) UI slots (Customer app)
### 5.1 Home screen
Add a fixed slot zone that renders up to 4 blocks in this order:
1) promo_strip (if exists)
2) venue_list (recommended)
3) item_carousel (trending items across country, optional)
4) venue_list (new venues, optional)

Component requirements:
- skeleton while loading
- empty state if no blocks: show default “Browse venues”
- no new navigation tabs

### 5.2 Venue menu screen (/v/{slug})
Add a fixed slot zone:
- top: small “Recommended” block (item_carousel) above categories (optional)
- mid: “Popular here” block
- bottom near cart pill: upsell_row (max 3)

Rules:
- block rendering must never reorder the actual category list
- blocks must be collapsible (one tap) but not required

---

## 6) Rendering rules (prevents UI chaos)
Frontend must:
- render only known block types
- ignore unknown blocks safely
- clamp items to max allowed
- never trust title_text beyond max length
- never render HTML from blocks

---

## 7) Caching & realtime (basic wiring)
- Cache reads by key (surface+country+venue+segment) in server layer
- UI subscribes to realtime updates on curation_blocks rows (optional in this workflow; can stub)
- If realtime is not implemented yet, just poll on focus.

---

## 8) Testing & verification
### 8.1 Unit tests
- schema validator tests (limits, types, forbidden words)
- renderer clamps unknown block types and limits items

### 8.2 E2E smoke
- Home renders blocks for RW
- /v/{slug} renders at least one block and menu still works
- ordering tap budget unchanged

---

## 9) Acceptance criteria (measurable)
- Block schema exists and is enforced
- curation_blocks table exists with correct RLS (read-only to clients)
- Customer Home and Venue Menu render blocks in fixed slots
- Baseline endpoints populate curation_blocks successfully
- No “AI” words appear in UI
- No journey changes; ordering still ≤ 4 taps

---

## 10) Verification evidence
Provide:
- files created/changed (paths)
- migration ids + brief policy summary
- screenshots:
  - Home with blocks
  - Venue menu with “Popular here” block
- tests run (commands + results)
- /scope-guard pass/fail

---

## 11) Output format (mandatory)
At end, output:
- Files changed (paths)
- DB changes summary
- API endpoints created
- Screens updated
- Tests run
- /scope-guard pass/fail
- Next workflow recommendation: /signals-and-taste-profile-lite
