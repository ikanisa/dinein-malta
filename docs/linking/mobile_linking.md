# Mobile Linking Configuration

**Goal**: Ensure the OS intercepts `https://dinein.app/v/*` and opens the native app.

## Android (App Links)

### AndroidManifest.xml
```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="dinein.app" />
    <data android:pathPrefix="/v/" />
</intent-filter>
```

### Asset Links File
**URL**: `https://dinein.app/.well-known/assetlinks.json`
**Content**:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.dinein.customer",
    "sha256_cert_fingerprints": [
       "RELEASE_KEY_SHA256_FINGERPRINT_HERE",
       "DEBUG_OR_STAGING_KEY_SHA256_IF_NEEDED"
    ]
  }
}]
```

## iOS (Universal Links)

### Entitlements (`Runner.entitlements`)
```xml
<key>com.apple.developer.associated-domains</key>
<array>
    <string>applinks:dinein.app</string>
</array>
```

### Apple App Site Association (AASA)
**URL**: `https://dinein.app/.well-known/apple-app-site-association`
**Headers**: `Content-Type: application/json`
**Content**:
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "<TeamID>.com.dinein.customer",
        "paths": [ "/v/*", "/" ]
      }
    ]
  }
}
```
