# Production Checks (Cutover)

Run these checks **immediately** after the app is available on the Stores.

---

## 1. Asset & Infrastructure Verification
*   [ ] **Domains**:
    *   `https://dinein.app/.well-known/assetlinks.json` is reachable and contains the **Production Keystore SHA-256**.
    *   `https://dinein.app/.well-known/apple-app-site-association` is reachable and contains the **Production Team ID**.
*   [ ] **Edge Functions**:
    *   `create_customer_order` is deployed to Production Supabase.
    *   `ring_bell` is deployed to Production Supabase.
    *   Rate limits are active (configured in Redis/DB).

## 2. Store Download Verification
*   [ ] **Clean Install**: Uninstall old versions. Download fresh from App Store / Play Store.
*   [ ] **Launch**: App launches without immediate crash.
*   [ ] **Default State**: App opens to empty Home (or previously visited if using shared storage, but ideally clean).

## 3. The "Golden Path" Test
Perform this flow on a real device:
1.  **Scan QR** (or tap Deep Link `https://dinein.app/v/prod-test-venue`).
2.  **App Opens**.
3.  **Venue Loads**: Menu appears.
4.  **Add Item**: Tap "Add" on a drink.
5.  **Checkout**: Tap Floating Cart -> Checkout.
6.  **Place Order**: Select "Cash" -> Swipe/Tap to Place.
7.  **Success**: Order Confirmation screen appears.
8.  **Verify**:
    *   Venue Owner sees order in Admin Portal.
    *   Order appears in "History" tab on App.

## 4. Fallback Verification
*   [ ] **Uninstall App**.
*   [ ] Scan the same QR.
*   [ ] **Verify**: Browser opens -> PWA loads -> Menu is visible.

## 5. Payment Handoff
*   [ ] **RW Venue**: Select MoMo -> Tap Pay -> Verify USSD dialer opens with `*182*...`.
*   [ ] **MT Venue**: Select Revolut -> Tap Pay -> Verify Revolut App/Web opens.
