---
description: 
---

---
name: /flutter-release-android-ios
description: Prepares the Flutter customer app for production release on Android and iOS: signing, build flavors, store assets, deep link verification in release builds, staged rollout, and a release checklist with rollback.
---

# /flutter-release-android-ios (Customer Flutter App)

## 0) Scope lock (non-negotiable)
This workflow covers:
- release builds and signing
- app store readiness (icons, metadata, screenshots plan)
- deep link verification in release builds
- staged rollout + rollback plan

It must NOT:
- add new product features or screens
- introduce login/signup
- add maps/location/payment APIs/delivery

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Flutter release Android + iOS"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Build flavors (recommended)
Create flavors:
- dev
- staging
- prod

Each flavor has:
- app name suffix (dev/staging)
- different bundle id/applicationId
- different Supabase env endpoints if needed
- telemetry flags

Document in:
- /docs/flutter_customer/flavors.md

---

## 3) Android release (required)
### 3.1 Signing setup
- configure release keystore
- store keystore securely (never in repo)
- set up gradle signing configs
- ensure App Links verification uses release SHA-256

### 3.2 Build outputs
- AAB for Play Store
- APK for internal testing (optional)

### 3.3 Deep link verification (release)
- confirm https://<domain>/v/<slug> opens app in release build
- confirm fallback to web when app not installed

Document steps and commands.

---

## 4) iOS release (required)
### 4.1 Signing & capabilities
- ensure bundle id matches AASA appID
- ensure Associated Domains is set for production domain

### 4.2 Build outputs
- archive for TestFlight
- TestFlight internal -> external testing

### 4.3 Universal Links verification (release)
- confirm /v/<slug> opens app from Safari/WhatsApp
- confirm fallback to web if not installed

Document steps.

---

## 5) Store assets checklist (required)
Create `/docs/flutter_customer/store_assets.md`:

### Icons
- iOS: 1024x1024 App Store icon + required set
- Android: adaptive icon + legacy
- Provide maskable icon variants

### Screenshots plan
Minimum:
- Home (venue discovery)
- Venue menu
- Cart
- Checkout (payment method selection)
- Order received
- Bell ring

### Copy rules
- do not mention “AI”
- do not promise payment confirmation
- emphasize “dine-in only”

---

## 6) Release checklist (required)
Create `/docs/flutter_customer/release_checklist.md`:

Pre-release:
- run tests
- verify deep links on real devices
- verify offline cache basics
- verify ordering flow (4 taps)
- verify no forbidden features

Release:
- publish to TestFlight/internal track
- staged rollout:
  - 5% -> 20% -> 50% -> 100%

Post-release:
- monitor crashes + key funnels
- confirm AASA/assetlinks reachable and correct
- confirm support channels

Rollback:
- halt rollout / revert to last stable
- hotfix checklist

---

## 7) App privacy and permissions (must be minimal)
- no location permission
- no contacts permission
- no SMS permission
- no camera permission required (no in-app scan)

Document in:
- /docs/flutter_customer/permissions.md

---

## 8) Testing & verification
Automated:
- flutter test
- analyze/lint

Manual (must):
- Android: App Links in release build
- iOS: Universal Links in TestFlight build
- order placement end-to-end
- bell ring end-to-end

---

## 9) Acceptance criteria (measurable)
- release builds generated successfully
- signing configured correctly
- deep links verified in release builds
- store assets checklist complete
- staged rollout plan documented
- minimal permissions confirmed
- /scope-guard passes

---

## 10) Verification evidence
Provide:
- files changed (paths)
- build commands used
- deep link test results summary
- checklist docs
- /scope-guard pass/fail

---

## 11) Output format (mandatory)
At end, output:
- Files changed (paths)
- Release commands summary
- Deep link verification summary
- Rollout plan summary
- /scope-guard pass/fail
