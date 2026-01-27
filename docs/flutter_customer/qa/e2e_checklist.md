# End-to-End (E2E) QA Checklist

**Version**: 1.0.0
**Scope**: Customer App (Flutter)

---

## 🏗️ Install & Launch
*   [ ] **Install**: App installs successfully from Store/TestFlight.
*   [ ] **Launch**: App opens < 2s to Home Screen.
*   [ ] **First Run**:
    *   No "Allow User Tracking" prompt (iOS).
    *   No "Allow Notifications" prompt immediately (should be deferred).
    *   No "Allow Location" prompt (EVER).

## 📍 Deep Linking (Critical)
*   [ ] **Cold Start**: Scan QR (while app killed) -> Opens App -> Loads Venue.
*   [ ] **Warm Start**: Scan QR (while app backgrounded) -> Bring to Front -> Loads Venue.
*   [ ] **Invalid Slug**: Scan QR with bad slug -> Show Error / "Venue not found".
*   [ ] **PWA Fallback**: Uninstall App -> Scan QR -> Opens Browser (PWA).

## 🍔 Menu & Discovery
*   [ ] **Menu Load**: Images load without layout shift (Skeletons used).
*   [ ] **Scrolling**: Sticky headers (Categories) work smoothly.
*   [ ] **Add Item**:
    *   Tap "+" -> Haptic bump.
    *   Cart pill updates.
    *   Cart pill bump animation triggers.

## 🛒 Cart & Checkout (Tap Budget)
*   [ ] **View Cart**: Tap Pill -> Opens Cart.
*   [ ] **Modify Qty**: +/- buttons update total instantly.
*   [ ] **Checkout**: "Checkout" button tap -> Haptic -> Opens Payment Selection.
*   [ ] **Payment**:
    *   Select "Cash" -> Place Order -> Success.
    *   Select "MoMo" -> Opens Dialer.
    *   Select "Revolut" -> Opens Revolut/Link.

## 🛡️ States & Error Handling
*   [ ] **Offline**: Turn on Airplane mode -> Pull to refresh -> "No Internet" Toast.
*   [ ] **Rate Limit**: Tap Bell 5x fast -> "Too many requests" error.
*   [ ] **Empty State**: Open history on fresh install -> "No orders yet" message.

## 📱 Platform Specifics
*   **Android**: Back button on home screen minimizes app (doesn't exit/pop incorrectly).
*   **iOS**: Swipe to go back works on all sub-screens.
