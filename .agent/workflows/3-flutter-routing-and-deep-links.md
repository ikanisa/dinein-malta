---
description: 
---

---
name: /flutter-routing-and-deep-links
description: Sets up Flutter navigation with go_router and production-grade deep linking so venue QR links (/v/{slug}) open the installed Flutter app. If not installed, the same URL must open the PWA. Includes link verification steps for Android App Links and iOS Universal Links.
---

# /flutter-routing-and-deep-links (Customer Flutter App)

## 0) Scope lock (non-negotiable)
This workflow creates:
- navigation architecture (go_router)
- deep link handling for:
  - / (home)
  - /v/{slug} (venue menu entry)
  - /orders/{id} (optional future)
- OS integration:
  - Android App Links
  - iOS Universal Links
- a test/verification checklist for deep links

It must NOT:
- add in-app QR scanning UI
- change product journeys
- introduce login/auth flows
- add maps/location/payment APIs/delivery

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Flutter routing + deep links"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Dependency decision (standard)
Use:
- go_router (router + deep links)
- (optional) flutter_native_splash (nice launch polish later)

Pin versions and document them in:
- apps/flutter_customer/pubspec.yaml
- /docs/flutter_customer/deps.md

---

## 3) Route map (must match product)
Implement routes (minimum):
- / -> HomeScreen (bottom nav: Home)
- /settings -> SettingsScreen (bottom nav: Settings)
- /venue/{id-or-slug} OPTIONAL internal route (not required)
- /v/{slug} -> VenueMenuEntryScreen (deep link entry)
  - immediately loads venue by slug
  - sets activeCountry from venue.country
  - then shows VenueMenuScreen

Hard rule:
- There is NO Scan tab/screen.

---

## 4) Navigation architecture (clean + testable)
Create:
- apps/flutter_customer/lib/app/router/app_router.dart
- apps/flutter_customer/lib/app/router/routes.dart
- apps/flutter_customer/lib/app/shell/app_shell.dart

Pattern:
- AppShell hosts BottomNav with two branches:
  - Home stack
  - Settings stack
- Deep link /v/{slug} must open in the Home branch context but push VenueMenu.

Router rules:
- use typed route params if feasible
- never rely on global mutable state for slug navigation
- handle unknown routes with a minimal NotFound page (SEO not relevant here, but UX is)

---

## 5) Deep link parsing + normalization
Create:
- apps/flutter_customer/lib/app/deeplinks/deeplink_parser.dart

Rules:
- accept both:
  - dinein.app/v/{slug}
  - dinein.app/v/SLUG (case normalize)
- slug normalization:
  - trim spaces
  - lower-case
  - replace consecutive hyphens
- if slug invalid -> show NotFound with “Back to Home” CTA

---

## 6) Platform setup — Android App Links (required)
### 6.1 Manifest intent filters
Update:
- android/app/src/main/AndroidManifest.xml

Add intent filter for:
- https://<your-domain>/v/*
- https://<your-domain>/

Set:
- android:autoVerify="true"

### 6.2 Digital Asset Links file
Host at:
- https://<your-domain>/.well-known/assetlinks.json

It must include:
- package name
- SHA-256 cert fingerprint(s) for release keystore

Document steps to obtain SHA-256 for:
- debug (local testing)
- release (production)

### 6.3 Verification checklist
- use Android’s link verification tools
- ensure clicking the QR link opens the app when installed
- ensure fallback to web when not installed

---

## 7) Platform setup — iOS Universal Links (required)
### 7.1 Associated domains entitlement
Update:
- ios/Runner/Runner.entitlements

Add:
- applinks:<your-domain>

### 7.2 Apple App Site Association (AASA)
Host at one of:
- https://<your-domain>/.well-known/apple-app-site-association
- https://<your-domain>/apple-app-site-association

Ensure:
- correct appID (TeamID.BundleID)
- paths include:
  - /v/*
  - /

### 7.3 Verification checklist
- install app on device
- open Safari link to /v/{slug}
- confirm it opens the app
- confirm fallback to web when not installed

---

## 8) Web/PWA fallback strategy (must coordinate)
Coordinate with landing/PWA:
- the same /v/{slug} URL must:
  - open Flutter app if installed (via app/universal links)
  - otherwise open PWA venue menu
- keep the PWA route stable; do not add redirects that break app links
- avoid adding query params that change canonical behavior for landing pages

Document in:
- /docs/flutter_customer/deep-link-contract.md

---

## 9) QA utilities (must add)
Add a simple internal debug screen (dev only):
- apps/flutter_customer/lib/app/deeplinks/deeplink_debug_screen.dart

It shows:
- last received deep link
- parsed slug
- resolved venue id (after fetch)
- activeCountry after resolution

Guard with:
- kDebugMode only

---

## 10) Testing & verification
### 10.1 Unit tests
- deeplink parser normalization
- router path matching for /v/{slug}

### 10.2 Manual device tests (required)
- Android:
  - click https://<domain>/v/<slug>
  - open from QR scanner
  - open from WhatsApp link
- iOS:
  - open from Safari
  - open from WhatsApp link

Validate:
- opens app if installed
- fallback to web if not installed
- slug routes to correct venue menu

---

## 11) Acceptance criteria (measurable)
- go_router implemented with Home + Settings shell
- /v/{slug} deep link opens Venue Menu in-app
- Android App Links configured with assetlinks.json hosted
- iOS Universal Links configured with AASA hosted
- Deep link contract documented
- Debug tooling exists (dev-only)
- /scope-guard passes

---

## 12) Verification evidence
Provide:
- files changed (paths)
- manifest/entitlements snippets (brief)
- URLs for assetlinks.json and AASA (no secrets)
- device test notes for Android + iOS
- tests run (commands + results)
- /scope-guard pass/fail

---

## 13) Output format (mandatory)
At end, output:
- Files changed (paths)
- Routes summary
- Deep link contract summary
- Test results summary
- Next workflow recommendation: /flutter-data-layer-supabase-no-auth
- /scope-guard pass/fail
