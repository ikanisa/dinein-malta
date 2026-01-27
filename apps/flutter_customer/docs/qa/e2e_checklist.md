# Flutter Customer App - E2E Manual QA Checklist

**Date**: _______________
**Tester**: _______________
**Device**: _______________ (Model + OS)
**Build**: ________________ (Flavor + Version)

---

## 1. Install & Launch
- [ ] **Install**: App installs successfully without errors.
- [ ] **First Launch**: App opens to "Venue Discovery" (Home) or "Scan" prompt immediately.
- [ ] **No Permission Prompts**:
    - [ ] No Camera permission requested on launch.
    - [ ] No Location permission requested.
    - [ ] No Contacts permission requested.

## 2. Deep Linking (Critical)
*Test with app installed (Release build).*

- [ ] **Valid Venue**: `https://dinein.app/v/kigali-heights`
    - [ ] Opens App directly (not browser).
    - [ ] Navigates to Venue Menu screen.
    - [ ] Sets active country correctly (e.g., RW).
- [ ] **Invalid Venue**: `https://dinein.app/v/invalid-slug`
    - [ ] Opens App.
    - [ ] Shows "Venue not found" or "Error" state (No crash).
- [ ] **No App Installed** (Simulator/Browser check):
    - [ ] Link redirects to PWA/Web version.

## 3. Venue Discovery (Home)
- [ ] **List Load**: Venues load with skeleton animation.
- [ ] **Images**: Venue thumbnails load (or show placeholders).
- [ ] **Navigation**: Tapping a venue opens its menu.
- [ ] **Back Nav**: Back button returns to Home list state (scroll position preserved if possible).

## 4. Menu & Ordering (4-Tap Rule)
1. **Tap 1 (Add)**: Tap "ADD" on an item.
    - [ ] Item added to cart.
    - [ ] Floating Cart Pill appears/updates.
2. **Tap 2 (Cart)**: Tap Floating Cart Pill.
    - [ ] Cart drawer/screen opens.
    - [ ] Correct items and total shown.
3. **Tap 3 (Checkout)**: Tap "Go to Checkout".
    - [ ] Checkout screen opens.
    - [ ] Payment method selected (default) or selectable.
    - [ ] No forced login.
4. **Tap 4 (Place)**: Tap "Place Order".
    - [ ] Order placed successfully.
    - [ ] Redirects to Order Confirmation screens.

## 5. Payment Handoff (No In-App Payment)
- [ ] **Rwanda (MoMo)**:
    - [ ] Select MoMo -> Tap Pay.
    - [ ] System phone dialer opens with USSD code (e.g., *182*...).
    - [ ] Return to App -> Order is still visible/placed.
    - [ ] App implies "Confirm payment manually" (no green checkmark for payment).
- [ ] **Malta (Revolut)**:
    - [ ] Select Revolut -> Tap Pay.
    - [ ] Opens Revolut App or Browser.
    - [ ] Return to App -> Order is still visible/placed.
- [ ] **Cash**:
    - [ ] Place Order -> Success immediately.

## 6. Offline Behavior
- [ ] **Cache Check**:
    - [ ] Load Home -> Go Airplane Mode -> Kill App -> Open App.
    - [ ] Home still shows list (from cache).
- [ ] **Action Block**:
    - [ ] Try to Place Order while Offline.
    - [ ] Error message displayed ("No connection"). App does NOT crash.
- [ ] **Recovery**:
    - [ ] Turn Wifi On.
    - [ ] Retry -> Success.

## 7. Bell Feature
- [ ] **Entry**: Tap "Bell" icon on Menu header.
- [ ] **Flow**:
    - [ ] Asks for Table Number (if not set).
    - [ ] Sends "Ring" request.
    - [ ] Shows "Waiter notified" success toast/dialog.

## 8. Accessibility Quick Check
- [ ] **Text Size**: Increase OS Font Size -> App text scales readable (doesn't clip badly).
- [ ] **Contrast**: Text on transparent/glass headers is legible.
- [ ] **Targets**: "Add", "Back", and "Bell" buttons are easily tappable (min 44x44 points visual or haptic area).

---
**Pass / Fail**: ___________
**Blocker Issues**:
1.
2.
