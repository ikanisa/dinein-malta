# Build Flavor Strategy

## Overview
The Flutter Customer App uses three distinct flavors to manage environments. Each flavor corresponds to a specific backend environment and application ID.

## Flavors

| Flavor | Environment | App ID | App Name | Backend |
| :--- | :--- | :--- | :--- | :--- |
| **dev** | Development | `com.dinein.customer.dev` | DineIn Dev | `dinein-dev` (Supabase) |
| **staging** | Staging | `com.dinein.customer.staging` | DineIn Staging | `dinein-staging` (Supabase) |
| **prod** | Production | `com.dinein.customer` | DineIn | `dinein-prod` (Supabase) |

## Build Commands

### Run locally
```bash
# Dev
flutter run --flavor dev

# Staging
flutter run --flavor staging

# Prod (Release mode usually)
flutter run --flavor prod --release
```

### Build for Release

**Android (App Bundle)**
```bash
flutter build appbundle --flavor prod --release
```

**iOS (Archive)**
```bash
flutter build ipa --flavor prod --release
```

## Configuration Files
*   **Android**: `android/app/build.gradle.kts` defines the `productFlavors`.
*   **iOS**: Schemes (`dev`, `staging`, `prod`) must map to the correct `.xcconfig` (managed via Xcode).
*   **Flutter**: `main_dev.dart`, `main_staging.dart`, `main_prod.dart` entries map to the correct flavor (if using entry-point splitting). *Note: Currently we use `main.dart` with compile-time variables or env detection if not using split entries.*
