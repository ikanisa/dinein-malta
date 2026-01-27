# Landing Page — Sitemap

## Route Structure

```
/                    → Home (Hero + Install CTA)
/rwanda              → Rwanda landing (country-specific)
/malta               → Malta landing (country-specific)
/venues              → (Optional) SEO venue directory
/venue/{slug}        → (Optional) SEO venue profile page (NOT the in-app menu)
/claim               → Venue owner onboarding
/privacy             → Privacy policy
/terms               → Terms of service
```

---

## Deep Link Handoff
The landing page links TO the PWA/app entry routes:
- `/v/{slug}` — Opens in-app venue menu (PWA or Flutter app).
- `/v/{slug}?t={tableNo}` — Opens menu with table pre-selected.

**Important**: `/v/{slug}` is app territory. `/venue/{slug}` (optional) is an SEO-friendly public profile on the marketing site.

---

## Navigation (Header)
- **Logo** → `/`
- **Venues** → `/venues` or country pill switcher (`/rwanda`, `/malta`)
- **For Venues** → `/claim`
- **Install CTA** (sticky on mobile)

---

## Footer Links
- **Company**: About (if exists), Careers (if exists)
- **Legal**: `/privacy`, `/terms`
- **Countries**: `/rwanda`, `/malta`
- **Social**: Instagram, Twitter (if applicable)

---

## Index Policy

| Route          | robots index | Canonical          |
|----------------|--------------|---------------------|
| `/`            | Yes          | self                |
| `/rwanda`      | Yes          | self                |
| `/malta`       | Yes          | self                |
| `/venues`      | Yes          | self                |
| `/venue/{slug}`| Yes          | self                |
| `/claim`       | Yes          | self                |
| `/privacy`     | Yes          | self                |
| `/terms`       | Yes          | self                |

---

## hreflang (Future)
If multi-language support added:
- `en-rw` for Rwanda English
- `en-mt` for Malta English
- `rw` for Kinyarwanda (future)
