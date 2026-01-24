---
description: 
---

---
name: /country-mode-hardening
description: Hardens all country-specific behavior: RW vs MT gating, currency display, payment handle validation, and discovery filtering based on venue-derived activeCountry. Prevents cross-country leakage and UI confusion.
---

# /country-mode-hardening (DineIn)

## 0) Scope (hard-locked)
This workflow enforces correct RW/MT behavior across customer/venue/admin.
Must NOT add:
- maps/geolocation
- payment APIs/verification
- scanner UI
- delivery

Must preserve:
- country derived from venue deep link
- discovery is database + country-based only

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Country mode hardening"
Output must include:
- Scope lock + exclusions
- Plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Country authority rules (single source of truth)
Define and use in packages/core:

### 2.1 Canonical country source
- Venue.country_id is the source of truth.
- activeCountry is a client context derived from:
  1) current deep-linked venue country
  2) last saved activeCountry (local storage)
  3) profile.active_country (if authenticated and stored)
  4) fallback = unknown (then show minimal chooser ONLY if required)

User never manually selects country in normal flow.
(Only allow a hidden/manual override in Settings if explicitly requested later.)

### 2.2 Prevent “country drift”
When user opens /v/{slug}:
- overwrite activeCountry = venue.country_id
- persist activeCountry (local storage)
- optionally upsert profile.active_country if authenticated

---

## 3) Payment mode gating (strict)
Implement a single function:
- getPaymentOptions(venue.country_id, venue.paymentHandles) -> options

Rules:
- RW:
  - show Cash always
  - show MoMo USSD only if venue.momo_code exists
  - never show Revolut
- MT:
  - show Cash always
  - show Revolut link only if venue.revolut_link exists
  - never show MoMo

UI:
- If handle missing, show disabled option with short instruction:
  - “Not configured by venue yet.”

No “Paid” status. No verification.

---

## 4) Currency rules (consistent, no surprises)
### 4.1 Display currency
- RW -> RWF
- MT -> EUR
Currency display for menu items should be consistent:
- formatMoney(amount, currency, locale)

Rules:
- For RW, use RWF formatting without decimals by default (unless you choose otherwise).
- For EUR, use 2 decimals.

### 4.2 Storage strategy
Choose one:
A) Store price + currency per item (recommended)
B) Derive currency from venue country at render time (acceptable for v1)

If OCR produces currency:
- validate it; if missing, set from venue country at publish time.

---

## 5) Venue portal validation (handles)
### 5.1 MoMo code (RW only)
- Field enabled only when venue.country_id=RW
- Validate basic shape (length/characters) but keep it permissive
- Save only to momo_code column

### 5.2 Revolut link/handle (MT only)
- Field enabled only when venue.country_id=MT
- Validate it’s a URL or accepted handle pattern (basic)
- Save only to revolut_link column

Disable and hide irrelevant fields; do not let owners set both.

---

## 6) Discovery filtering consistency (customer)
Home (venue discovery) must:
- show venues WHERE venue.country_id == activeCountry AND status=Active
- default sorting: featured/promos then alphabetical (no distance)

Search must:
- search only within activeCountry by default
- optionally allow “All countries” switch only in Settings (later; not required)

---

## 7) Admin consistency rules
Admin tools must:
- display country prominently on venue cards/claims
- prevent assigning a RW owner to a MT venue? (allowed) — ownership can be cross-country, but the venue stays in its country.
- allow editing venue country only with a guarded action (rare; audit logged)

---

## 8) Edge cases (must handle)
- User visits app root without prior venue context:
  - show Home with:
    - last activeCountry if exists
    - else show a minimal country pick sheet (RW/MT) once, store it
  Keep it one tap to dismiss; do not block deep link entry ever.
- User opens MT venue after using RW:
  - activeCountry must flip to MT immediately
- Venue missing payment handle:
  - show Cash + disabled payment option with “not configured”

---

## 9) Implementation sequence (in order)
1) Implement country context module in packages/core
2) Wire /v/{slug} entry to set activeCountry always
3) Update Home discovery queries to filter by activeCountry
4) Implement payment option gating + UI states
5) Implement currency formatting helper
6) Add venue portal handle validations + field gating
7) Add admin labels and guarded country edit (optional)
8) Add tests + run /scope-guard

---

## 10) Acceptance criteria (measurable)
- Opening /v/{slug} always sets activeCountry = venue.country
- Home shows only venues in activeCountry
- RW venue checkout never shows Revolut
- MT venue checkout never shows MoMo
- Disabled payment option appears when handle missing
- Currency formatting is consistent and correct per country
- No manual country selection required during QR/venue entry flow

---

## 11) Verification evidence
Manual:
- Open RW venue deep link -> checkout shows Cash + MoMo (if configured)
- Open MT venue deep link -> checkout shows Cash + Revolut (if configured)
- Switch between RW and MT links -> activeCountry updates immediately
- App root with no context -> minimal country sheet appears once (if implemented)

Automated:
- Unit: getPaymentOptions for RW/MT + missing handles
- Unit: formatMoney outputs expected strings
- E2E: visit RW venue then MT venue and verify checkout options

Evidence:
- screenshots: checkout RW vs MT, Home filtering, venue portal payment settings

---

## 12) Output format (mandatory)
At end, output:
- Files changed (paths)
- Country rules summary (where implemented)
- Tests run (commands + results)
- Demo steps
- Known gaps + next workflow recommendation
- /scope-guard pass/fail
