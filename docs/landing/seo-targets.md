# Landing Page — SEO Targets

## 1) Keyword Themes (Not Stuffed)

### Primary Keywords
- "dine in ordering Rwanda"
- "restaurant ordering Malta"
- "QR code menu order"
- "table ordering app"

### Secondary Keywords
- "restaurant POS Rwanda"
- "café ordering system"
- "Kigali restaurant tech"
- "Valletta dining app"

### Long-tail
- "order food at restaurant without app download"
- "scan QR code order food table"

---

## 2) Internal Linking Plan

| From           | To                    | Anchor Text                   |
|----------------|-----------------------|-------------------------------|
| `/`            | `/rwanda`             | "Explore Rwanda venues"       |
| `/`            | `/malta`              | "Explore Malta venues"        |
| `/`            | `/claim`              | "Add your venue"              |
| `/rwanda`      | `/venues?country=RW`  | "See all Rwanda venues"       |
| `/malta`       | `/venues?country=MT`  | "See all Malta venues"        |
| `/claim`       | `/`                   | "Learn more about DineIn"     |
| All pages      | `/privacy`, `/terms`  | Footer links                  |

---

## 3) Metadata Rules

### Title Format
- Home: "DineIn — Dine-In Ordering for Rwanda & Malta"
- Country: "DineIn Rwanda — Order at Your Table"
- Claim: "Add Your Venue to DineIn — Free Setup"
- Legal: "Privacy Policy | DineIn" / "Terms of Service | DineIn"

### Description Length
- 150-160 characters max
- Include primary keyword naturally
- End with CTA hint

### Example Meta Descriptions
- `/`: "Order food at your table with DineIn. Scan the QR code, browse the menu, and pay—no app download required. Available in Rwanda and Malta."
- `/claim`: "Join DineIn for free. Add your restaurant, café, or bar and let customers order directly from their phones."

---

## 4) Structured Data Plan

### Organization (site-wide)
```json
{
  "@type": "Organization",
  "name": "DineIn",
  "url": "https://dinein.rw",
  "logo": "https://dinein.rw/logo.png"
}
```

### WebSite (home page)
```json
{
  "@type": "WebSite",
  "name": "DineIn",
  "url": "https://dinein.rw"
}
```

### FAQPage (if FAQ section exists)
```json
{
  "@type": "FAQPage",
  "mainEntity": [...]
}
```

---

## 5) Canonical Rules
- Every page has `<link rel="canonical" href="...">` pointing to itself.
- Country pages are distinct (not alternates of each other).
- `/venues?country=RW` → canonical to `/rwanda` OR keep separate (TBD).

---

## 6) Performance Targets (SEO-affecting)

| Metric | Target    | Notes                       |
|--------|-----------|-----------------------------|
| LCP    | < 2.5s    | Hero content above fold    |
| INP    | < 200ms   | Button interactions        |
| CLS    | < 0.1     | No layout shifts on load   |
| FID    | < 100ms   | (Legacy, covered by INP)   |

---

## 7) robots.txt
```
User-agent: *
Allow: /
Sitemap: https://dinein.rw/sitemap.xml
```

---

## 8) sitemap.xml Generation
- Auto-generate from routes.
- Include `<lastmod>` for dynamic pages.
- Exclude internal/admin routes.
