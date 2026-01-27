# Flutter Customer App - Architecture

## Monorepo Location
`apps/flutter_customer/`

## Project Structure
Standard Clean Architecture + Feature-first packaging.

```
lib/
├── app/                  # App configuration, routing, theme, DI
│   ├── router.dart
│   ├── theme.dart
│   └── app.dart
├── core/                 # Core utilities, not feature-specific
│   ├── design/           # Design system (tokens, atoms, molecules) - SYNC with PWA
│   ├── network/          # Supabase client, HTTP helpers
│   ├── storage/          # Local storage (SharedPrefs/Hive)
│   └── error/            # Failure classes
├── features/             # Feature modules
│   ├── home/             # Discovery logic
│   ├── venue/            # Venue details & Menu logic
│   ├── cart/             # Cart state management
│   ├── order/            # Order placement & status
│   └── settings/
└── shared/               # Shared models & widgets
    ├── models/           # Generated models (Freezed)
    └── widgets/          # Common UI components
```

## Data Principles
- **Supabase**: Direct connection for public read (Venues, Menus).
- **No Auth**: Use Anonymous Auth or Public API Key for reads.
- **Writes**: Orders submitted via RPC or Edge Function to ensure validation without user login.
- **State Management**: Riverpod (recommended) or Bloc.
- **Offline**: Cache menus for offline browsing (Hive/Isar).

## Tech Stack
- **Framework**: Flutter (Latest Stable).
- **Languages**: Dart.
- **Backend**: Supabase (PostgreSQL + Edge Functions).
- **Navigation**: GoRouter.
