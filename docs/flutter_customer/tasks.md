# Flutter Customer App - Tasks

## Phase 1: Foundation
- [ ] **Setup**: Initialize `apps/flutter_customer` in monorepo.
- [ ] **Config**: specific `pubspec.yaml`, analysis options, environment config.
- [ ] **CI/CD**: Setup build pipeline (Github Actions / Codemagic).
- [ ] **Design System**: Port "Soft Liquid Glass" tokens to Flutter Theme.

## Phase 2: Core Features
- [ ] **Navigation**: Setup GoRouter and Deep Link handling (`/v/:slug`).
- [ ] **Data Layer**: Supabase client setup (Anonymous access).
- [ ] **Home Screen**: Venue discovery list (mocked -> real).
- [ ] **Venue Menu**: Category tabs, product cards, skeleton loading.
- [ ] **Item Detail**: Bottom sheet for item selection/modifiers.

## Phase 3: Cart & Order
- [ ] **Cart State**: Local cart management (Add/Remove/Update).
- [ ] **Checkout UI**: Payment method selector (Static options based on country).
- [ ] **Order Submission**: RPC call to place order.
- [ ] **Order Tracking**: Polling or Realtime subscription for status updates.

## Phase 4: Polish & Verify
- [ ] **Animations**: Hero transitions, micro-interactions using standard duration tokens.
- [ ] **Offline**: Basic offline support for viewed menus.
- [ ] **Testing**: Unit tests for Cart logic, Widget tests for main screens.
