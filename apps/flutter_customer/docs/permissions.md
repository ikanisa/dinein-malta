# App Privacy & Permissions Audit

## Principles
- **Minimalism**: Request ONLY what is absolutely necessary.
- **Privacy-First**: No tracking, no contacts, no location unless critical (excluded in scope).

## Android (`AndroidManifest.xml`)

### Required Permissions
- `android.permission.INTERNET`: Required for API and web comms.
- `android.permission.ACCESS_NETWORK_STATE`: For connectivity checks.

### Forbidden / Removed Permissions
- `android.permission.ACCESS_FINE_LOCATION` (Maps/Location excluded)
- `android.permission.ACCESS_COARSE_LOCATION`
- `android.permission.CAMERA` (QR scanning is external via system camera)
- `android.permission.READ_CONTACTS`
- `android.permission.SEND_SMS`

## iOS (`Info.plist`)

### Required Keys
- `NSAppTransportSecurity`: Configuration for network safety.
- `LSApplicationQueriesSchemes`: For deep linking to other apps (e.g., Revolut, MoMo if applicable).

### Forbidden / Removed Keys
- `NSLocationWhenInUseUsageDescription`
- `NSCameraUsageDescription`
- `NSContactsUsageDescription`
- `NSPhotoLibraryUsageDescription` (unless profile upload is added, but currently out of scope)

## Action Items
- [x] Verify `AndroidManifest.xml` is clean.
- [x] Verify `Info.plist` has no unused usage descriptions.
