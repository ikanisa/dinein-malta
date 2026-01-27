# Flutter Customer App - Acceptance Gates

## 1. Performance Gates
- [ ] **Startup Time**: < 1.5s on high-end, < 2.5s on mid-range devices.
- [ ] **Frame Rate**: UI must maintain 60fps during scrolling and transitions.
- [ ] **Bundle Size**: Initial download size < 20MB (Android App Bundle).

## 2. Functionality Gates
- [ ] **Deep Linking**: Opening `dinein://v/test-venue` MUST land directly on the menu.
- [ ] **Guest Flow**: User can browse and order WITHOUT being asked to login.
- [ ] **Order Lifecycle**: Verified flow: Place Order -> Received -> Served.
- [ ] **Payment Handoff**: Selecting "MoMo" correctly triggers the USSD dialer (or simulation).

## 3. UI/UX Gates
- [ ] **Tap Budget**: Verified <= 4 taps from Menu to Order.
- [ ] **Design Parity**: Fonts, colors, and spacing match the web PWA standards.
- [ ] **Empty States**: No blank screens; proper empty/error widgets implemented.

## 4. Code Quality Gates
- [ ] **Linting**: No analysis errors or warnings (very strict rules).
- [ ] **Tests**: Core business logic (Cart/Pricing) covered by Unit Tests.
