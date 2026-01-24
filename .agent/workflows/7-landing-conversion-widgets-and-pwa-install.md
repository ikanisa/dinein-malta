---
description: 
---

---
name: /landing-conversion-widgets-and-pwa-install
description: Implements high-conversion landing widgets that feel like a native app: Install/Open dock, sticky CTA rail, share link, country switch, venue claim conversion blocks, and a respectful PWA install flow (no aggressive popups). SEO-safe, performance-safe.
---

# /landing-conversion-widgets-and-pwa-install (DineIn Marketing Site)

## 0) Scope lock (non-negotiable)
This workflow implements:
- conversion-focused widgets and interactions
- PWA install guidance (respectful, not spammy)
- “Open app” deep linking
- “Share app” utilities

It must NOT:
- add maps/location, payment APIs/verification, scanning, delivery
- add chat UI
- add intrusive popups or dark patterns
- degrade SEO (content must remain crawlable)

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Landing conversion + PWA install"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Conversion surfaces (must implement)
### 2.1 Primary CTA (every page)
- “Open app”
- fallback: “Install to Home Screen” help

Rules:
- CTA must not block reading
- mobile-first placement (top + sticky rail)

### 2.2 Sticky CTA rail (mobile)
Create a sticky bottom rail:
- left: country pill (RW/MT)
- center: Open app
- right: Share

Constraints:
- rail height small
- safe-area inset support (iPhone)

### 2.3 Install Dock widget (hero area)
Implement `InstallDockWidget`:
- Detect if already installed / running standalone
- Show:
  - “Open app” if installed
  - “Add to Home Screen” steps link if not installed
- Do NOT auto-trigger install prompt; only on user gesture

### 2.4 Share link widget
- shares the landing url OR app universal url
- if Web Share API supported, use it
- else copy-to-clipboard with toast

No “AI” wording.

---

## 3) PWA install flow (respectful)
Create `/docs/landing/install-help.md` with simple steps:
- iOS Safari: Share -> Add to Home Screen
- Android Chrome: Install app
- Desktop: Install icon

In UI:
- Show install help link, not a nag pop-up
- Optionally show a one-time nudge after 30s of engagement
  - only if user scrolls and interacts
  - dismissible
  - never re-show for 14 days

---

## 4) Deep linking rules (Open app)
Define `openAppUrl()` rules:
- if on /venue/[slug] landing profile:
  - Open app -> /v/{slug}
- if on country page:
  - Open app -> app home with country preselected (or default)
- if unknown country:
  - Open app -> default (with country switch available)

Do not auto-change country without user action unless deriving from a venue link.

---

## 5) Venue claim conversion widgets (must implement)
Add “Claim your venue” sections on:
- / (home)
- /rwanda
- /malta
- /claim

Widget content:
- benefits (3 bullets)
- “Claim venue” CTA
- “Upload menu, review, publish” summary (no technical jargon)

Rules:
- no promises about instant approval
- keep it simple: “Submit for review”

---

## 6) SEO-safe interaction design
- CTA widgets must not hide main content from crawlers
- All essential text remains in HTML
- Buttons/links are real elements (no JS-only navigation)

---

## 7) Analytics (minimal, optional)
Track:
- open_app_click
- install_help_open
- share_click
- claim_click

No invasive tracking.

---

## 8) Testing & verification
Manual QA:
- iOS Safari: install help visible and correct
- Android Chrome: install works (prompt appears on click if eligible)
- Standalone mode: “Open app” behavior correct
- Share works (native share or copy)

Automated (if possible):
- unit tests for URL building
- basic e2e: sticky rail exists, buttons clickable

Performance check:
- widgets do not add heavy JS
- rail does not cause CLS

---

## 9) Acceptance criteria (measurable)
- Sticky CTA rail exists on mobile
- InstallDockWidget implemented and respectful
- Share works with fallback
- Open app deep links correctly (including /v/{slug})
- Claim conversion blocks exist and are consistent
- No intrusive popups
- SEO and performance are not degraded

---

## 10) Verification evidence
Provide:
- files changed (paths)
- screenshots (mobile) showing sticky rail + install dock
- install help doc path
- tests run (commands + results)
- /scope-guard pass/fail

---

## 11) Output format (mandatory)
At end, output:
- Files changed (paths)
- Widgets implemented
- Deep link rules summary
- QA notes (iOS/Android)
- Tests run
- /scope-guard pass/fail
- Next workflow recommendation: /landing-deploy-observe-and-seo-monitoring
