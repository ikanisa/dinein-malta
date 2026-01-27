# Hybrid QR Linking Test Plan

**Goal**: Verify 100% reliability of the QR contract across platforms.

## Test Cases

### 1. Android - App Installed (Release Build)
*   **Setup**: Install `app-prod-release.aab` (or APK signed with release key).
*   **Action**: Scan QR `https://dinein.app/v/test-venue`.
*   **Expected**:
    1.  Disambiguation dialog ("Open with DineIn or Chrome") OR opens App directly.
    2.  App navigates to Venue Menu.
    3.  Active Country set to Venue's country.

### 2. iOS - App Installed (TestFlight/Release)
*   **Setup**: Install via TestFlight.
*   **Action**: Open Camera -> Scan QR.
*   **Expected**:
    1.  Yellow pill/banner in Camera app shows "Open in DineIn".
    2.  Tapping it opens App directly.
    3.  Deep link handler routes to Venue Menu.

### 3. App NOT Installed (PWA Fallback)
*   **Setup**: Uninstall app.
*   **Action**: Scan QR `https://dinein.app/v/test-venue`.
*   **Expected**:
    1.  Opens Default Browser (Safari/Chrome).
    2.  Loads PWA.
    3.  Displays Venue Menu.

### 4. Edge Case: Invalid Slug
*   **Action**: Scan `https://dinein.app/v/invalid-slug-123`.
*   **App Behavior**: Open App -> Show "Venue Not Found" screen -> CTA "Go Home".
*   **Web Behavior**: Open Browser -> Show "Venue Not Found" page -> CTA "Go Home".

## Troubleshooting
*   **Android**: Verify SHA-256 fingerprint in `assetlinks.json`.
*   **iOS**: Check AASA file validation (using branch.io validator or similar). Note that Apple caches AASA for up to 24h.
