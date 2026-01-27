# Telemetry Stack Strategy

## Selection: Sentry
We have chosen **Sentry** over Firebase Crashlytics for this iteration.

### Rationale
- **Lightweight**: fast setup with `sentry_flutter`.
- **Unified**: Handles both Crash Reporting (Native/Dart) and Performance/Tracing in one SDK.
- **Privacy Controls**: Excellent data scrubbing and PII stripping capabilities out of the box.
- **Monorepo Friendly**: Easy to segregate environments (DSN) if needed.

## Configuration
- **Package**: `sentry_flutter`
- **DSN**: Injected via `dart-define` or `.env` (Secure).
- **Kill Switch**: `TELEMETRY_ENABLED` environment variable.
