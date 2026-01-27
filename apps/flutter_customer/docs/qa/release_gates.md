# QA Release Gates (Blockers)

The application CANNOT be released to Production if ANY of the following gates are failed.

## 🔴 Gate 1: Deep Link Integrity
*Pass Criteria*:
1. `https://dinein.app/v/{slug}` **MUST** open the app directly on both Android (App Links) and iOS (Universal Links).
2. If app is NOT installed, the link **MUST** fallback gracefully to the Web/PWA (or Store), never a 404 or raw JSON.

## 🔴 Gate 2: The 4-Tap Rule
*Pass Criteria*:
A new user must be able to complete an order in ≤ 4 interaction steps from the Menu screen.
- **Fail** if: Forced Login appears.
- **Fail** if: "Select Payment" appears when only 1 method exists or default is set.
- **Fail** if: Unnecessary "Upsell" modals appear blocking the path.

## 🔴 Gate 3: Payment Handoff
*Pass Criteria*:
- **Rwanda**: MoMo USSD dialer MUST launch with correct code.
- **Malta**: Revolut App/Link MUST launch.
- **General**: App must NEVER say "Payment Verified" automatically. It must implies "Order Placed" or "Waiting for confirmation".

## 🔴 Gate 4: Privacy & Compliance
*Pass Criteria*:
- **ZERO** runtime permission prompts for: Camera, Location, Contacts, Microphone.
- **NO** "AI" or "Delivery" terminology in the UI texts.

## 🔴 Gate 5: Stability
*Pass Criteria*:
- **Crash Free User %** > 99.8% in Staging/Internal testing.
- No "White Screen of Death" on startup (offline or online).
- Images must load (or show placeholders), never overflow/error pixels.
