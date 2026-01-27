---
description: 
---

---
name: /flutter-customer-kickoff-scope-lock
description: Sets the Flutter customer app scope, architecture, and strict UX constraints (no auth, no maps, no payment APIs). Produces the plan, tasks, and acceptance gates.
---

# /flutter-customer-kickoff-scope-lock (Customer Mobile App)

## 0) Non-negotiable product rules
Customer Flutter app must:
- require NO account creation, NO login, NO signup, NO OTP
- open directly to Home (venue discovery)
- preserve the same minimalist customer journeys as the customer PWA
- support QR deep link entry to a venue menu (/v/{slug}) via OS deep links
- keep ordering to <= 4 taps from menu view to placing order attempt

Must NOT include:
- maps, geolocation, location-based venue sorting
- payment API integration or payment verification
- in-app QR scanner UI (QR scan happens outside the app via camera)
- delivery concepts or delivery statuses

Statuses allowed:
- received, served, cancelled (and optional: pending/accepted if already in your system)

Countries:
- Malta + Rwanda
- country is derived from venue; user does not manually select country as a required step

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Flutter customer app (no-auth) implementation"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

## 2) Repo structure (monorepo)
Create:
- apps/flutter_customer/

Inside:
- lib/
  - app/ (router, app shell)
  - features/
    - home/
    - venue/
    - menu/
    - cart/
    - checkout/
    - orders/
    - settings/
  - core/
    - design/ (tokens, theme, widgets)
    - data/ (api clients, repositories)
    - storage/ (local cache)
    - utils/
  - shared/ (common UI + models)

## 3) Navigation baseline
- bottom nav: Home + Settings
- deep link entry: /v/{slug} opens Venue Menu screen
- no extra “scan” tab/screen in the app

## 4) Data boundaries
Flutter app can:
- read venues, menus, promos (country-scoped)
- create orders + order items
- send “ring bell” requests (table number input)

Flutter app must not:
- confirm payment
- store sensitive user identifiers as mandatory fields
- require WhatsApp number to use the app (optional only in Settings)

## 5) UX constraints checklist
- 1-hand mobile usability
- tap targets >= 44px
- skeleton loading for lists
- no images required (text-first, chips, cards, micro-widgets)
- liquid-glass feel allowed but capped (no heavy blur everywhere)

## 6) Deliverables (must output in this workflow)
Create:
1) /docs/flutter_customer/brief.md
2) /docs/flutter_customer/sitemap.md (screens + deep links)
3) /docs/flutter_customer/architecture.md
4) /docs/flutter_customer/tasks.md
5) /docs/flutter_customer/acceptance_gates.md

## 7) Acceptance gates (measurable)
- App launches to Home with usable UI in < 2 seconds on mid devices (target)
- Deep link /v/{slug} routes correctly
- Venue menu -> cart -> pay handoff -> order created works without login
- No forbidden features implemented
- Consistent theme with PWA design system

## 8) Output format (mandatory)
At end, output:
- Files created/changed (paths)
- Screen map summary
- Gates list
- Next workflow recommendation: /flutter-design-system-liquid-glass
- /scope-guard pass/fail
