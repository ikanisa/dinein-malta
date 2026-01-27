---
description: 
---

---
name: /hybrid-qrcode-linking-contract
description: Defines and implements the single “QR link contract” for DineIn so venue QR codes always work: open Flutter app when installed, otherwise open the customer PWA menu. Includes URL scheme, routing rules, hosting requirements, and test plan.
---

# /hybrid-qrcode-linking-contract (Flutter + PWA)

## 0) Goal (the whole point)
A venue QR code should encode exactly ONE URL:
- https://<domain>/v/{venueSlug}

Behavior:
- If Flutter app is installed: OS opens Flutter app directly to that venue menu.
- If Flutter app not installed: browser opens customer PWA directly to that venue menu.
- No user country selection required; venue.country drives country context.

Non-goals:
- in-app QR scanning UI
- maps/location
- payment APIs/verification
- extra redirect chains that break App Links / Universal Links

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Hybrid QR linking contract"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) URL contract (must be explicit)
Canonical venue entry:
- https://<domain>/v/{slug}

Rules:
- slug is lowercase, hyphenated
- no required query params
- avoid URL shorteners

Optional parameters (allowed only if stable and ignored safely):
- ?ref=... (marketing attribution)
- must not change routing behavior

Document in:
- /docs/linking/qr_contract.md

---

## 3) Server routing rules (web side)
On the web/PWA:
- /v/{slug} renders the customer PWA venue menu entry (or a tiny web entry page that immediately loads the venue menu)
- DO NOT 302 redirect /v/{slug} to other paths unless you fully test App Links/Universal Links impact
- If you need a “web fallback” page:
  - keep it minimal
  - load venue menu UI immediately
  - include “Open in app” CTA (for edge cases)

Document in:
- /docs/linking/web_routing.md

---

## 4) Mobile linking rules (native side)
Flutter:
- deep link route /v/{slug} must open:
  - VenueMenuEntryScreen -> VenueMenuScreen
  - set activeCountry from venue.country after resolving slug

Android App Links:
- intent filters include /v/* and /
- assetlinks.json served at:
  - https://<domain>/.well-known/assetlinks.json
- include release SHA-256 fingerprint(s)

iOS Universal Links:
- Associated Domains: applinks:<domain>
- AASA file served at:
  - https://<domain>/.well-known/apple-app-site-association
- include paths:
  - /v/*
  - /

Document in:
- /docs/linking/mobile_linking.md

---

## 5) Don’t-break-it rules (very important)
- Never put the venue slug behind a hash route for the QR entry (avoid #/v/slug)
- Keep /v/{slug} stable forever
- Avoid adding middleware redirects on /v/*
- If you must add redirects:
  - do it only after running the full device deep link test suite
- Keep SSL valid and HSTS sensible (links require https)

---

## 6) QR code generation spec
Venue portal generates:
- Venue URL: https://<domain>/v/{slug}
- Venue QR (encoded with that URL)

QR design rules:
- error correction level: M or Q
- quiet zone: minimum 4 modules
- include small DineIn logo in center only if it does not reduce scan reliability
- print sizes:
  - table stand: minimum 3–4 cm QR
  - wall/poster: larger

Document in:
- /docs/linking/qr_generation.md

---

## 7) Edge cases and fallbacks
### 7.1 App installed but link opens browser
Provide a fallback “Open in app” CTA on web:
- use the same https URL (do not use custom schemes as primary)
- optionally support a custom scheme only as a secondary fallback:
  - dinein://v/{slug}
but never encode custom scheme in the QR as the primary.

### 7.2 Venue slug missing/invalid
Web:
- show “Venue not found” + search + home CTA
Flutter:
- NotFound screen + back to Home

### 7.3 Country switching
- Country is derived from venue.country after slug resolution
- Store lastActiveCountry for Home discovery, but do not force modal

---

## 8) Test plan (must be runnable)
Create:
- /docs/linking/test_plan.md

Tests:
1) Android (release build):
   - open /v/{slug} from QR scanner
   - open /v/{slug} from WhatsApp
   - open /v/{slug} from Chrome
2) iOS (TestFlight build):
   - open /v/{slug} from camera scan
   - open /v/{slug} from WhatsApp
   - open /v/{slug} from Safari
3) Not installed (both):
   - /v/{slug} opens web/PWA venue menu
4) Invalid slug:
   - correct not-found behavior

Acceptance: 100% pass on both platforms.

---

## 9) Deliverables (must create)
- /docs/linking/qr_contract.md
- /docs/linking/web_routing.md
- /docs/linking/mobile_linking.md
- /docs/linking/qr_generation.md
- /docs/linking/test_plan.md

---

## 10) Acceptance criteria (measurable)
- Single QR URL works across:
  - Android installed (opens app)
  - iOS installed (opens app)
  - not installed (opens PWA)
- No redirect chains breaking App Links / Universal Links
- Venue country correctly sets customer context
- Invalid slugs handled gracefully
- /scope-guard passes

---

## 11) Verification evidence
Provide:
- files created/changed (paths)
- hosted URLs:
  - /.well-known/assetlinks.json
  - /.well-known/apple-app-site-association
- device test notes (Android + iOS)
- /scope-guard pass/fail

---

## 12) Output format (mandatory)
At end, output:
- Files changed (paths)
- Contract summary (URL + behaviors)
- Test results summary
- Next workflow recommendation: /flutter-pwa-shared-design-tokens-sync
- /scope-guard pass/fail
