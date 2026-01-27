# Landing Page — Product Brief

## 1) Positioning
DineIn is a **dine-in-only ordering system** for restaurants, cafés, and bars in **Rwanda** and **Malta**. The landing page is the public marketing website that drives app installs and venue onboarding.

---

## 2) Hard Scope Exclusions (DO NOT VIOLATE)
- **NO Maps / Geolocation**: No "Near Me" sorting or location permissions.
- **NO Payment API integrations**: Links may point to payment providers, but no in-page verification.
- **NO In-App QR Scanning UI**: QR scanning happens outside the app (device camera → deep link).
- **NO Delivery Concepts**: Dine-in only, no delivery statuses.

---

## 3) Primary CTA
- **Install / Open App** (platform-detect: PWA install prompt, or App Store / Play Store link when mobile app available).

## 4) Secondary CTAs
- **Discover Venues** — link into `/rwanda` or `/malta` country landing pages.
- **Claim Your Venue** — link to `/claim` venue onboarding page.

---

## 5) Pages Overview

| Route         | Purpose                              | Content Type |
|---------------|--------------------------------------|--------------|
| `/`           | Hero + Install CTA + trust badges   | Static       |
| `/rwanda`     | RW-specific copy + venue preview    | Semi-dynamic |
| `/malta`      | MT-specific copy + venue preview    | Semi-dynamic |
| `/claim`      | Venue owner onboarding marketing    | Static       |
| `/privacy`    | Privacy policy                      | Static       |
| `/terms`      | Terms of service                    | Static       |
| `/venues`     | (Optional) SEO venue directory      | Dynamic      |

---

## 6) Success Metrics
- **Install rate** from landing → PWA/App install.
- **Venue claim submissions** via `/claim`.
- **Core Web Vitals**: LCP < 2.5s, INP < 200ms, CLS < 0.1.
- **SEO ranking** for "order food [city]", "dine in [country]".
