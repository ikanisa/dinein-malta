# Signing & Deep Link Setup

## Android Signing
**NEVER COMMIT KEYSTORE FILES OR PASSWORDS TO GIT.**

1. **Generate Upload Key**:
   ```bash
   keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
   ```
2. **Properties File**: Create `android/key.properties` (GitIGNORED):
   ```properties
   storePassword=<password>
   keyPassword=<password>
   keyAlias=upload
   storeFile=../upload-keystore.jks
   ```
3. **Gradle Config**: `android/app/build.gradle` references this file to sign `release` builds.

## iOS Signing
1. **Certificates**: Ensure you have a valid "Apple Distribution" certificate in Keychain.
2. **Profiles**: Download "App Store" distribution provisioning profile matching `com.dinein.customer`.
3. **Xcode**: Set "Automatically manage signing" for `Runner` target, selecting your Team.

## Deep Links (App Links / Universal Links)

### Domain Verification (Release)
The release build is signed with a different key than debug. You MUST update `assetlinks.json` on the web server to include the **Release SHA-256**.

1. **Get Release SHA-256**:
   ```bash
   keytool -list -v -keystore upload-keystore.jks -alias upload
   ```
2. **Update Web**: Add this SHA to `/.well-known/assetlinks.json` on `dinein.app`.
3. **Verify**:
   Install release build -> Click `https://dinein.app/v/slug` -> Must open App (no disambiguation dialog on Android 12+).

### iOS Universal Links
1. **Associated Domains**: Ensure `applinks:dinein.app` is in Entitlements.
2. **AASA File**: Ensure `apple-app-site-association` file is valid and hosted on `dinein.app`.
