# Deep Link Contract

This document defines the canonical URL structure for the **DineIn Customer App** and **PWA**. Both platforms must respect these routes.

## Domain
`https://dinein.app` (and `www.dinein.app`)

## Canonical Routes

### 1. Venue Entry
**URL**: `/v/{slug}`  
**Example**: `https://dinein.app/v/kigali-heights-cafe`

**Behavior**:
- **App Installed**: Opens the app directly.
  - Sets active context to this venue.
  - Determines country from venue metadata (fetched or embedded).
  - Navigates to **Venue Menu** screen (hiding bottom nav).
- **App Not Installed**: Opens the PWA at the same URL.
  - PWA loads the venue menu.

**Params**:
- `?t={table_number}` (Optional): Pre-selects a table for ordering.
  - Example: `/v/kigali-heights-cafe?t=12`

### 2. Home (Fallback)
**URL**: `/`  
**Example**: `https://dinein.app/`

**Behavior**:
- Opens the **Home Screen** (Venue Discovery).

## Technical Requirements

### Android (App Links)
- `assetlinks.json` must be hosted at `/.well-known/assetlinks.json`.
- SHA-256 fingerprint of the release keystore must be included.

### iOS (Universal Links)
- `apple-app-site-association` (AASA) must be hosted at `/.well-known/apple-app-site-association`.
- Team ID and Bundle ID must match the build.
