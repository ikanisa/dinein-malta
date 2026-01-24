---
description: 
---

---
name: /landing-ia-copy-and-seo-brief
description: Produces the landing site’s information architecture, minimal high-signal copy, SEO heading structure, internal linking map, and FAQ set (RW + MT). No fluff. No feature creep.
---

# /landing-ia-copy-and-seo-brief (DineIn Marketing Site)

## 0) Scope lock (non-negotiable)
This workflow creates:
- page list + content blocks per page
- headings (H1/H2/H3) per page
- metadata templates (title/description)
- FAQ (for SEO + trust)
- internal linking plan

It must NOT:
- add product features
- include maps/geolocation/delivery/payment APIs/scanner UI
- add large image dependencies (images optional, not required)

Brand requirements:
- modern, minimal, premium
- “dine-in only” is a core differentiator
- avoid mentioning “AI” in user-facing copy
- RW + MT coverage

---

## 1) Kickoff (mandatory)
Run: /kickoff with scope: "Landing IA + copy + SEO brief"
Output must include:
- scope lock + exclusions
- plan + tasks + acceptance criteria + verification plan
Stop at execution gate unless XS.

---

## 2) Deliverables (must be produced)
Create or update these docs:

1) /docs/landing/ia.md
2) /docs/landing/copy.md
3) /docs/landing/metadata.md
4) /docs/landing/faq.md
5) /docs/landing/internal-linking.md

---

## 3) Information architecture (ia.md)
For each route define:
- purpose
- primary CTA
- secondary CTA
- sections (ordered)
- what is static vs dynamic
- index policy (index/noindex)

Minimum routes:
- /
- /rwanda
- /malta
- /venues (optional)
- /venue/{slug} (optional SEO profile page, not in-app menu)
- /claim
- /privacy
- /terms

Rules:
- keep routes small; do not create dozens of pages
- country pages must differentiate RW vs MT behaviors (MoMo USSD vs Revolut link) without implying API verification

---

## 4) Copy system (copy.md)
Write copy as reusable blocks:
- Hero headline + subhead
- 3 benefit bullets
- 3 “Dine-in only” trust chips
- How it works (3 steps max)
- Country-specific payment handoff explanation (neutral)
- Venue claim value prop (for owners)
- CTA labels (short)
- Footer microcopy

Constraints:
- headline max 9 words
- subhead max 18 words
- paragraphs max 2 lines on mobile
- avoid hype and unverifiable claims (“best”, “#1”)

No “AI” wording anywhere.

---

## 5) SEO heading structure (embedded in copy.md + metadata.md)
For every page:
- Exactly one H1
- H2 sections: 3–6 max
- H3 used only inside FAQ or feature lists

Define:
- preferred keywords per page (1 primary theme + 2 secondary)
- avoid keyword stuffing

---

## 6) Metadata templates (metadata.md)
For each route:
- title template (50–60 chars target)
- meta description (140–160 chars target)
- OG title/description
- canonical rule
- robots directive

Include:
- language defaults (en)
- future-ready notes for multilingual (en/fr/kin) but do not implement here unless already planned

---

## 7) FAQ set (faq.md)
Create 8–12 FAQs total, split:
- Global (dine-in only)
- Rwanda-specific (MoMo USSD flow, no API verification)
- Malta-specific (Revolut link flow, no API verification)
- Venue-owner (claim venue, menu upload/review, order statuses)

Rules:
- answers must be short and direct
- do not promise payment confirmation
- do not mention “AI”

These FAQs will later be used for FAQPage structured data.

---

## 8) Internal linking plan (internal-linking.md)
Define:
- primary nav links (max 5)
- footer links
- contextual links between:
  - / -> /rwanda, /malta, /claim
  - /rwanda -> /venues?country=RW (optional)
  - /venue/{slug} -> /claim (for owners)
- no orphan pages

Also define:
- link to open the app (PWA) and link to “Add to Home Screen” help

---

## 9) Acceptance criteria (measurable)
- Every page has: purpose, CTAs, sections, H1/H2 plan
- Copy is minimal, consistent, and country-aware
- Metadata templates exist for all routes
- FAQ is complete and policy-safe (no payment verification promises)
- Internal linking ensures no orphan pages
- No mention of “AI” anywhere in user-facing docs

---

## 10) Verification evidence
Provide:
- list of created/updated docs (paths)
- word count sanity (keep lean)
- a quick “mobile skim” checklist (headline clarity, CTA clarity)
- /scope-guard pass/fail

---

## 11) Output format (mandatory)
At end, output:
- Files changed (paths)
- IA summary (routes + goals)
- Copy blocks summary
- Next workflow recommendation: /landing-ui-system-liquid-glass
- /scope-guard pass/fail
