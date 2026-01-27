---
description: 
---

---
name: /flutter-home-venue-discovery
description: Implements the Customer Home experience in Flutter: country-scoped venue discovery (database-based, no location), promos, rich widgets, fast lists with skeletons, and seamless navigation to venue menu. Matches the PWA UX and design system.
---

# /flutter-home-venue-discovery (Customer Flutter App)

## 0) Scope lock (non-negotiable)
This workflow builds:
- Home tab UI + logic
- venue discovery list (country-scoped, not location)
- promos + rich widgets (text-first)
- search (semantic/intelligent via backend endpoint or simple text search v1)
- navigation into Venue Menu

It must NOT:
- add maps/location/geofencing
- add login/signup
- add payment APIs/verification
- add in-app QR scan UI
- add more tabs (Home + Settings only)

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Flutter Home venue discovery"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Screen structure (Home)
Implement:
- HomeScreen (tab root)
  Sections (order):
  1) Top bar: brand + country chip (RW/MT) (display-only unless user switches voluntarily)
  2) PromoStrip (if available)
  3) “Popular venues” carousel (text cards)
  4) “All venues” list (infinite/paged)
  5) Optional “Smart Picks” block (only if your curation blocks exist; still no “AI” wording)

Rules:
- keep above-the-fold light
- no images required
- skeletons while loading

---

## 3) Country behavior (critical)
Country comes from:
- last activeCountry stored locally (default unknown)
- updated automatically when user opens a venue (venue.country)
- optionally user can switch between RW/MT on Home for discovery only (not required)

Hard rule:
- do not force a country selection modal on first launch
- do not use location to infer country

---

## 4) Data sources
Use repositories:
- listVenues(country)
- listPromos(country)
- searchVenues(country, query)

Search v1:
- simple contains match via backend endpoint
Search v2 (later):
- semantic search (server-side), but Home must work without it.

---

## 5) Rich widgets (must implement)
Using design system widgets:
- CountrySwitchPill (optional; hidden if country unknown and you prefer default list)
- PromoStripWidget
- VenuePreviewCarousel (horizontal)
- VenueList (vertical)
- EmptyStateWidget (if no venues)
- Pull-to-refresh

No images required. Use chips for:
- specialties
- amenities
- price band (if you store it)

---

## 6) Performance & UX rules (must enforce)
- List virtualization (ListView.builder)
- Avoid rebuild storms:
  - use Riverpod selectors (or equivalent)
- Prefetch next page when near bottom
- Cache venues per country and show cached instantly
- Skeleton state must match final layout height (reduce jitter)

---

## 7) Navigation to venue menu
On venue card tap:
- navigate to VenueMenuScreen (or entry screen)
- set activeCountry = venue.country
- store last_venue_id/slug for quick return (optional)

Also support deep link route:
- /v/{slug} should land here and still update activeCountry.

---

## 8) Error handling
- If promos fail, still show venues
- If venues fail and cache exists, show cache + “Tap to retry”
- If no cache, show EmptyState with Retry

---

## 9) Testing & verification
Unit tests:
- view model/state for paging and refresh
- country update logic when opening a venue

Widget tests:
- renders skeleton -> list
- empty state renders correctly

Manual QA:
- cold start shows Home quickly
- opening venue works
- pull-to-refresh works
- switching country (if enabled) updates list

---

## 10) Acceptance criteria (measurable)
- Home loads with cached venues immediately (if available)
- Venues list is country-scoped (no location usage)
- Promos and widgets render without images
- Tap into venue opens Venue Menu screen
- Country auto-updates based on venue
- No extra onboarding/login prompts exist
- /scope-guard passes

---

## 11) Verification evidence
Provide:
- files changed (paths)
- screenshots: Home loading + Home loaded
- sample venue card layout
- tests run (commands + results)
- /scope-guard pass/fail

---

## 12) Output format (mandatory)
At end, output:
- Files changed (paths)
- Home sections summary
- Performance notes
- Next workflow recommendation: /flutter-venue-menu-and-4-tap-order
- /scope-guard pass/fail
