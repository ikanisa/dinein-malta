# Flutter Telemetry Policy

## Overview
This document defines the privacy rules and data collection practices for the DineIn Customer App. WE PRIORITIZE USER PRIVACY.

## 1. What We Collect
We collect **strictly anonymous** technical telemetry to improve app stability and performance.

### Identifiers
- `session_id`: A randomly generated UUID created on app launch. Resets on reinstall or explicit clear.
- **NO** persistent device IDs (IMEI, MAC, Advertising ID).
- **NO** user accounts or emails (App is guest-only).

### Events
- **App Lifecycle**: `app_open`, `app_background`.
- **Navigation**: `venue_opened` (venue_id only), `screen_view`.
- **Commerce**: `add_to_cart` (count only), `checkout_started`, `order_placed` (order_id only).
- **Errors**: Crash stack traces, non-fatal exceptions (network timeouts, parse errors).

## 2. What We Do NOT Collect (Exclusions)
- **PII**: No names, phone numbers, email addresses.
- **Location**: No GPS coordinates. Country is derived from Venue context (e.g., scanning a QR code for a venue in Malta).
- **Payment**: No credit card details (handled externally by Revolut/MoMo).
- **Content**: No user notes or special instructions text.

## 3. Retention & Controls
- **Retention**: Data is retained for 90 days.
- **Opt-Out**: Users can disable "Share Usage Data" in Settings. This kills the `TelemetryService` locally.
