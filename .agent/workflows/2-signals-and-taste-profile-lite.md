---
description: 
---

---
name: /signals-and-taste-profile-lite
description: Adds a privacy-respecting signals layer and a lightweight taste profile to enable personalized curation blocks via segments. No chat UI. No “AI” wording. Includes opt-out toggle and minimal retention.
---

# /signals-and-taste-profile-lite (DineIn)

## 0) Scope lock (non-negotiable)
This workflow creates:
- event logging for discovery + menu interactions
- a lightweight taste profile derived from events
- segment assignment used by curation blocks
- a Settings toggle to disable personalization

It must NOT:
- add chat UI or any assistant UI
- mention “AI” in frontend copy
- collect location, contacts, payment confirmations, or sensitive text
- change journeys or add extra required steps

Preserve:
- customer nav = Home + Settings
- /v/{slug} entry and 4-tap order target

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Signals + taste profile lite"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Events to capture (strict allowlist)
Create `packages/core/signals/events.ts` with allowlisted events:

### 2.1 Customer events (must)
- home_view
- venue_card_view
- venue_open (from home)
- menu_view (when /v/{slug} menu renders)
- item_view
- add_to_cart
- remove_from_cart
- cart_open
- checkout_open
- order_place_attempt
- order_placed (when order record created)
- favorite_toggle

### 2.2 Venue/Admin (optional here)
Skip unless already needed.

Rules:
- No free-form text fields.
- Store only IDs + timestamp + tiny metadata (country, surface).
- Never store table number as a stable identity signal (it’s not a person).

---

## 3) Storage model (Supabase)
### 3.1 signals_events table
Columns:
- id uuid pk
- ts timestamptz
- app text (customer|venue|admin)
- session_id text (random, rotates)
- user_id uuid nullable (if authed)
- country text (RW|MT|unknown)
- venue_id uuid nullable
- item_id uuid nullable
- event_name text
- meta jsonb (whitelisted small keys only)

Indexes:
- (ts desc)
- (session_id, ts desc)
- (user_id, ts desc)
- (venue_id, ts desc)
- (item_id, ts desc)
- (event_name, ts desc)

RLS:
- Insert:
  - allow client insert via an Edge Function only (recommended)
  - or direct insert with strict policy (least preferred)
- Select:
  - client should NOT read raw events (avoid privacy leaks)
  - only server/service role reads for aggregation

Retention:
- keep raw events 30–90 days (configurable)
- aggregate summaries retained longer

### 3.2 taste_profiles table (derived)
Columns:
- id uuid pk
- user_id uuid nullable
- session_id text nullable (for anon)
- country text
- updated_at timestamptz
- features jsonb (small, bounded)
- segment text (one of approved)
- personalization_enabled boolean default true

RLS:
- User can read own profile (user_id match) OR session-bound reads if you support it safely
- User can toggle personalization_enabled for self
- No direct writes to features from client (server aggregation only)

---

## 4) Session identity (privacy-safe)
Define session_id rules:
- random UUID created on first visit
- stored in localStorage (or indexedDB)
- rotates every N days (e.g., 7) or on “Clear suggestions history”
- not tied to WhatsApp number unless user explicitly adds it (even then, do not use it for profiling)

---

## 5) Taste features (minimal, bounded)
Compute features without creep:
- category_affinity: {category_id: score} (top 5)
- item_affinity: {item_id: score} (top 10)
- price_band: low|mid|high (per country)
- drink_vs_food: drink|food|mixed (inferred)
- veg_friendly_prob: 0..1 (optional; derived only from explicit veg items)
- time_bucket_pref: lunch|evening|late (optional, coarse)

Rules:
- Never infer sensitive traits.
- Keep features small and capped.
- Do not store exact timestamps as “habits”; store coarse buckets.

---

## 6) Segment assignment (used by curation)
Define fixed segments (start small):
- anon_default
- new
- returning
- food_leaning
- drinks_leaning
- budget
- veg_friendly

Assignment logic:
- if < 5 meaningful events -> new
- if has past order_placed -> returning
- if category_affinity mostly drinks -> drinks_leaning
- if mostly food -> food_leaning
- if avg price band low -> budget
- if veg_friendly_prob high -> veg_friendly
Else -> anon_default

Store segment on taste_profiles and return it in curation requests.

---

## 7) Aggregation job (server-side)
Implement one of:
A) Scheduled Edge Function / cron job (recommended)
B) On-demand aggregation when requesting curation blocks

Aggregation steps:
1) fetch last N days of events for session/user
2) compute features
3) choose segment
4) upsert taste_profiles
5) write an audit row: taste_profile_runs (optional)

Hard limit:
- aggregation must be fast; cap events read per user/session (e.g., last 500)

---

## 8) Settings toggle (no “AI” wording)
In Customer Settings:
- Toggle label: “Personalized suggestions”
- Secondary action: “Clear suggestions history”

Behavior:
- OFF: segment forced to anon_default; do not aggregate new profile features (or aggregate but don’t use)
- Clear: rotate session_id, delete/expire taste profile for old session, clear local caches

No extra onboarding screens.

---

## 9) Curation integration
Update curation endpoints:
- accept segment parameter (or compute server-side)
- key caching by (surface, country, venue_id, segment, time_bucket)
- If personalization_enabled=false -> use anon_default

---

## 10) Testing & verification
Unit:
- segment assignment rules
- feature caps enforced
- toggle disables personalization usage

E2E:
- new session shows default blocks
- after a few add_to_cart + order_placed events, segment becomes returning and blocks differ (even subtly)
- turning OFF personalization reverts to anon_default blocks

---

## 11) Acceptance criteria (measurable)
- signals_events table exists with safe RLS (clients cannot read raw events)
- taste_profiles derived and stored with bounded features
- segment is computed and used by curation endpoints
- Settings has “Personalized suggestions” toggle and “Clear suggestions history”
- No UI mentions “AI”
- No location/contact/payment-confirmation data collected

---

## 12) Verification evidence
Provide:
- files created/changed (paths)
- migration ids + policy summary
- screenshots of Settings toggle
- sample (sanitized) taste_profiles row
- tests run (commands + results)
- /scope-guard pass/fail

---

## 13) Output format (mandatory)
At end, output:
- Files changed (paths)
- DB changes summary
- Aggregation method chosen
- Screens updated
- Tests run
- /scope-guard pass/fail
- Next workflow recommendation: /gemini-tools-contract
