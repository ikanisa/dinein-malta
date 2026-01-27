---
description: 
---

---
name: /flutter-app-store-listing-copy
description: Produces App Store + Google Play listing copy for the DineIn customer Flutter app: short/long descriptions, feature bullets, keywords, screenshot captions, and compliance-safe wording (no “AI”, no payment verification promises).
---

# /flutter-app-store-listing-copy (Customer Flutter App)

## 0) Scope lock (non-negotiable)
This workflow creates:
- store listing copy (Play + App Store)
- screenshot caption plan
- keywords/tags guidance
- compliance-safe wording

It must NOT:
- add app features you don’t have
- mention “AI”
- claim payment is verified in-app
- mention delivery, maps, or location-based discovery

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Flutter store listing copy"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Deliverables (must produce)
Create:
1) /docs/flutter_customer/store_listing/play_store.md
2) /docs/flutter_customer/store_listing/app_store.md
3) /docs/flutter_customer/store_listing/screenshots.md
4) /docs/flutter_customer/store_listing/keywords.md

---

## 3) Messaging pillars (must match product)
- Dine-in only (no delivery)
- Order from your table
- Simple, fast, minimal taps
- Two countries: Rwanda + Malta
- Payment handoff:
  - Rwanda: MoMo USSD
  - Malta: Revolut link
- Venue confirms payments manually (neutral wording)

Avoid:
- “smart”, “assistant”, “AI”, “powered by”
Use:
- “Recommended”, “Popular here”, “Quick add-ons” (if you show curated blocks)

---

## 4) Play Store copy (play_store.md)
Include:
- App name
- Short description (<= 80 chars style)
- Full description (scannable bullets)
- “What’s new” template
- Privacy notes (no location, no account required)

---

## 5) App Store copy (app_store.md)
Include:
- Promotional text
- Description (short paragraphs + bullets)
- Keywords guidance (not stuffed)
- Support URL + privacy URL placeholders
- Notes about permissions (minimal)

---

## 6) Screenshot plan (screenshots.md)
Provide 6–8 screenshots with captions:
1) “Explore venues” (Home)
2) “Open the menu” (Venue menu)
3) “Add in one tap” (Menu item add + cart pill)
4) “Review your cart” (Cart)
5) “Place your order” (Checkout)
6) “Order received” (Confirmation)
7) “Call the waiter” (Bell ring)
8) Optional: “Order history” (Settings)

Caption rules:
- max 4–6 words
- no “AI” wording
- no claims of payment verification

---

## 7) Keywords & tags (keywords.md)
Provide:
- 10–20 keyword themes (not stuffed)
Examples:
- dine in ordering
- restaurant menu
- bar menu
- table ordering
- Rwanda dining
- Malta dining
- MoMo USSD payment
- Revolut pay link
- order from table

Do NOT include:
- delivery keywords
- map/location keywords (unless your directory is location-based, which it is not)

---

## 8) Acceptance criteria (measurable)
- Copy matches the real features
- “Dine-in only” is clear
- No “AI” wording
- No payment verification promises
- Screenshot captions are short and consistent
- Links placeholders are included (privacy/support)

---

## 9) Verification evidence
Provide:
- files created (paths)
- quick compliance scan results (forbidden terms list)
- /scope-guard pass/fail

---

## 10) Output format (mandatory)
At end, output:
- Files changed (paths)
- Final short description
- Final feature bullets
- Next workflow recommendation: /flutter-e2e-device-qa-checklist
- /scope-guard pass/fail
