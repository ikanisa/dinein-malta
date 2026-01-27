# Flutter Customer App - Product Brief & Scope Lock

## 0) Mission
Build a **native-feeling, high-performance Flutter application** for the "Customer" profile of the DineIn system. The app focuses on speed, minimalism, and "Soft Liquid Glass" aesthetics.

## 1) Non-Negotiable Scope Exclusions (HARD LOCK)
Any feature in this list is **FORBIDDEN** unless explicitly approved by the Product Owner via an RFC.

- **NO Authentication**: No Signup, No Login, No Email/Phone collection for entry.
- **NO Maps / Geolocation**: User scans a QR code or picks a venue from a list. No "Near Me" sorting.
- **NO In-App Payment Processing**:
  - Payment is **handoff-only**:
    - **Rwanda**: Pop USSD for MoMo.
    - **Malta**: Launch Revolut Link in browser.
  - No credit card entry, no Stripe/PayPal SDKs.
- **NO In-App QR Scanner**: Deep links trigger the app from the system camera.
- **NO Delivery**: This is **Dine-In ONLY**.
- **NO Chat / Messaging**: Bell requests only.

## 2) Core Features
- **Venue Discovery**: Simple list of venues (filtered by derived country).
- **Menu Browsing**: Fast, category-based menu navigation.
- **Ordering**: Add to cart -> Place order (<= 4 taps).
- **Order Status**: Live status tracking (Placed -> Received -> Served).
- **Bell**: Call waiter / Request bill.

## 3) User Experience (UX) Laws
- **Tap Budget**: Max 4 taps from Menu to Order.
- **Performance**: < 2s Time to Interactive. 60fps animations.
- **Installation**: "Add to Home Screen" / "Install App" prompt only after meaningful engagement.
