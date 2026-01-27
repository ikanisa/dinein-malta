# Release Gates (Blockers)

Before promoting any build to Production, it MUST pass these gates.
**Status**: 🔴 = Blocker.

---

## 1. Deep Linking & Entry (Critical)
Failure here means users cannot enter a venue.

*   [ ] **Android App Links**: Opening `https://dinein.app/v/test-venue` opens the App (not browser) on Android 12+.
*   [ ] **iOS Universal Links**: Opening `https://dinein.app/v/test-venue` opens the App (not browser).
*   [ ] **Fallback**: Opening the URL on a device *without* the app installed loads the PWA Menu (web).
*   [ ] **Parameter Passing**: Opening `.../v/test-venue?t=5` correctly prefills Table 5 in the app context.

## 2. Core User Journey (Tap Budget)
Failure here degrades the primary UX promise.

*   [ ] **4-Tap Order**: From Menu -> Add Item -> Cart -> Checkout -> Place Order consumes ≤ 4 taps.
*   [ ] **No Login**: User can place an order *without* ever being prompted to sign up or log in.
*   [ ] **Performance**: Menu load time < 2s on 4G.

## 3. Payment Handoff (Regulatory/Functional)
Failure here means zero revenue.

*   [ ] **RW Mode**: Selecting "MoMo" launches the USSD dialer with the correct code.
*   [ ] **MT Mode**: Selecting "Revolut" launches the Revolut link/app.
*   [ ] **No In-App Payment**: We NEVER ask for credit card details directly in the app (App Store Compliance).

## 4. Security & Abuse
Failure here risks banning or venue harassment.

*   [ ] **Rate Limiting**: Attempting 5 orders in 1 minute triggers a visible "Too many requests" error.
*   [ ] **Permissions**: Manifest/Plist contains **NO** requests for:
    *   Location
    *   Camera
    *   Contacts
    *   Microphone

## 5. Stability
*   [ ] **Crash Free**: Staging build is 99.9% crash-free over the last 48h.
*   [ ] **App Size**: Android AAB < 20MB. iOS IPA < 40MB.

## 6. Compliance (App Store Rejection Proofing)
*   [ ] **No "AI" Context**: Store listing and App UI do not mention "AI" or "GenAI".
*   [ ] **No "Delivery"**: App clearly states "Dine-in Only".
