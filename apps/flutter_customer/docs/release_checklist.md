# Flutter Customer App - Release Checklist

## 1. Pre-Release Verification

### Signing & Build
- [ ] **Android**: `key.properties` is present and correct.
  - `flutter build appbundle --flavor prod` passes.
- [ ] **iOS**: Distribution certificate and provisioning profile installed.
  - `flutter build ipa --flavor prod` passes (requires iOS schemes to be set up).

### Critical Flows (Tap Budget & Scope)
- [ ] **Deep Link Entry**:
  - Scan QR / Open `https://dinein.app/v/test-venue` -> Opens App directly on Menu.
  - Verify Country is auto-set.
- [ ] **Order Flow** (≤ 4 taps):
  - Add Item -> Cart -> Checkout -> Place Order.
- [ ] **Connectivity**:
  - Turn off WiFi/Data -> Show offline message (no infinite loader).

### Assets & Metadata
- [ ] App Name is correct ("DineIn").
- [ ] App Icon is correct on device.
- [ ] Splash screen looks good (no white flash).

## 2. Release Execution

### Android (Play Store)
1. Run: `flutter build appbundle --flavor prod`
2. Output: `build/app/outputs/bundle/prodRelease/app-prod-release.aab`
3. Upload to **Internal Testing** track first.
4. Verify App Links (SHA-256 matches dashboard).
5. Promote to **Production** with staged rollout (5% -> 20% -> 50% -> 100%).

### iOS (App Store / TestFlight)
1. Run: `flutter build ipa --flavor prod`
2. Output: `build/ios/archive/Runner.xcarchive`
3. Upload to **TestFlight** via Xcode or Transporter.
4. Distribute to Internal Testers.
5. Verify Universal Links (AASA file matches Team ID).
6. Submit for Review.

## 3. Post-Release
- [ ] Monitor Crashlytics for spikes.
- [ ] Test "Add to Home Screen" prompt behavior in production.
- [ ] Verify deep links still work after store update.

## 4. Rollback Plan
- **Critical Bug**:
  - Android: “Halt rollout” in Play Console.
  - iOS: "Remove from Sale" or Submit expedited fix.
- **Bad Build**:
  - Revert git commit.
  - Bump version number `+1`.
  - Rebuild and resubmit immediately.
