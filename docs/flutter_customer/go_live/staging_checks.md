# Staging Checks (Pre-Prod)

Run these checks on the **Staging Flavor** build.

---

## 1. Environment Verification
*   [ ] **Supabase Connectivity**: Verify app connects to `dinein-staging` project (check logs or inspect network traffic).
*   [ ] **Feature Flags**: Verify `enable_haptics` is TRUE.
*   [ ] **Version Check**: About screen shows correct version (e.g., `1.0.0-staging.42`).

## 2. Edge Functions Integration
*   [ ] **Order Creation**:
    *   Add item to cart.
    *   Place order.
    *   Verify response comes from `create_customer_order` function (not direct DB insert).
*   [ ] **Bell Ring**:
    *   Tap Bell.
    *   Verify response comes from `ring_bell` function.

## 3. RLS & Security Smoke Test
*   [ ] **Anonymous Write Block**: Try to manually insert a row into `orders` (if possible via dev tools/proxy) -> Should FAIL.
*   [ ] **Abuse Guard**: Rapidly tap "Ring Bell" 5 times. 
    *   Expected: 1st/2nd succeed. 3rd+ fail with "Too many requests".

## 4. Deep Link Staging
*   [ ] Verify `https://staging.dinein.app/v/test` opens the Staging App.
*   [ ] Verify `assetlinks.json` on staging domain matches the Staging Signing Certificate hash.

## 5. Offline Behavior
*   [ ] Airplane Mode -> Open App -> Home.
    *   Expected: "No Connection" or cached venue list (if visited).
    *   Expected: Minimal UI (no infinite spinners).
*   [ ] Airplane Mode -> Place Order.
    *   Expected: Immediate "No internet connection" error toast.
