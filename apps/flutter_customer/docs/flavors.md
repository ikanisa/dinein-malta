# Flutter Customer App - Build Flavors

This document defines the build flavors used in the `apps/flutter_customer` project. We use flavors to separate development, staging, and production environments.

## Flavors

We support three standard dimensions/flavors:

| Flavor    | Environment | App Name suffix | Bundle ID / Application ID suffix | Use Case |
| :---      | :---        | :---            | :---                              | :--- |
| **dev**   | Development | `.dev`          | `.dev`                            | Local development, connecting to local/dev backend. |
| **staging**   | Staging     | `.staging`      | `.staging`                        | Internal testing, pre-release verification. |
| **prod**  | Production  | (none)          | (none)                            | Live store release. |

## Configuration Details

### Android (`android/app/build.gradle.kts`)
- **Dimension**: `env`
- **Product Flavors**: `dev`, `staging`, `prod`
- **Application ID**:
  - Dev: `com.dinein.customer.dev`
  - Staging: `com.dinein.customer.staging`
  - Prod: `com.dinein.customer`

### iOS (`ios/Runner.xcodeproj`)
- **Schemes**: `dev`, `staging`, `prod`
- **Configurations**:
  - `Debug-dev`, `Release-dev`
  - `Debug-staging`, `Release-staging`
  - `Debug-prod`, `Release-prod`
- **Bundle ID**:
  - Dev: `com.dinein.customer.dev`
  - Staging: `com.dinein.customer.staging`
  - Prod: `com.dinein.customer`

## Running & Building

### Run
```bash
flutter run --flavor dev
flutter run --flavor staging
flutter run --flavor prod
```

### Build
```bash
# Android
flutter build appbundle --flavor prod
flutter build apk --flavor dev

# iOS
flutter build ipa --flavor prod
flutter build ios --flavor dev
```
