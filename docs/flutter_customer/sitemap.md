# Flutter Customer App - Sitemap & Navigation

## Navigation Structure
Bottom Navigation Bar (2 Tabs ONLY):
1. **Home** (Venue Discovery)
2. **Settings** (History, Preferences, Legal)

## Screens

### 1. Home Tab (`/home`)
- **Venue List**: Vertical list of venues.
- **Promos**: Horizontal carousel of active promos.
- **Search**: optional search by name.

### 2. Venue Context (`/v/{slug}`)
*(Enters "Venue Mode" - hides Bottom Nav or changes context)*
- **Menu View**: Categories + Items.
- **Item Detail** (Bottom Sheet or Page): Customizations.
- **Cart** (Bottom Sheet / Floating Pill): View items, total.
- **Checkout** (Modal): Payment method selection (Cash/MoMo/Revolut).
- **Order Status**: Live tracking view.

### 3. Settings Tab (`/settings`)
- **Order History**: Local storage based.
- **App Info**: Version, Legal.
- **Theme**: Light/Dark toggle (if applicable).

## Deep Links
- `dinein://v/{venueSlug}` -> Opens **Menu View** for that venue.
- `dinein://v/{venueSlug}?t={table}` -> Opens **Menu View** with Table {table} pre-selected.

## Routing Logic
- **App Launch**:
  - If triggered by generic icon -> `Home`.
  - If triggered by URL/QR -> `/v/{slug}`.
- **Country Context**:
  - Auto-derived from the venue accessed.
  - Defaults to "RW" or "MT" based on last visited or locale.
