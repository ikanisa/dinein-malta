# Content Ops Playbooks — DineIn

## Content Taxonomy

### Venue Types
Bar, Restaurant, Cafe, Lounge, Club, Hotel Bar

### Cuisines
Rwandan, African Fusion, Grill/BBQ, Italian, Indian, Chinese, Middle Eastern, Seafood, Vegan/Vegetarian, Street Food

### Occasions
Date night, Family, Business, Birthday, Sports night, Live music, Late night

### Venue Tags
Open late, Happy hour, Live DJ, Live band, Outdoor seating, Rooftop, Wifi, Cocktail bar, Beer garden

### Item Tags
Signature, Popular, New, Spicy, Vegetarian, Vegan, Gluten-free option, Shareable, Quick

### Discount Types
Percent off, Fixed amount off, Buy X get Y, Happy hour pricing, Bundle, Loyalty perk (future)

---

## Venue Content Workflows

### 1. Onboarding
- Collect basics: name, address, timezone, features
- Upload hero image + gallery
- Set opening hours
- Assign taxonomy tags
- Publish only when completeness ≥90%

### 2. Menu Ingest
- Create draft with categories
- Add items with name, description, price, allergens
- Run `menu.draft.validate`
- Simulate pricing on sample carts
- Submit approval request

### 3. Offers Setup
- Create promo draft
- Run `promo.draft.simulate`
- Check overlap with existing promos
- Submit approval request

---

## Menu Quality Rules

**Required:**
- Each menu has ≥1 category
- Each category has ≥1 active item
- Item name: 2-60 chars
- Price ≥ 0 with valid currency
- No duplicate item names in same category
- Allergens from controlled list

**Controlled Allergens:**
peanuts, tree_nuts, milk, eggs, fish, shellfish, soy, wheat, sesame

---

## Offers/Discount Rules

**Rule Model:**
- Type, window (starts_at, ends_at)
- Eligibility: segments, day/time, min_spend
- Caps: max_discount, max_uses_per_guest

**Constraints:**
- No negative totals
- Discount ≤ subtotal
- Happy hour by venue timezone
- No stacking by default

---

## Personalization Signals

**Store Minimal:**
- Preferred cuisines, budget band, allergies
- Recently viewed venues, ordered items

**Privacy Boundaries:**
- No sensitive PII
- No exact location history
- No sharing guest-specific data with venues

---

## Merchandising

**Home Ranking Factors:**
- Distance, openNow, rating, active offers, cuisine match

**Venue Screen Layout:**
- Hero → Categories → Featured → Offers → Quick actions

---

## Data Quality Jobs

| Job | Frequency | Check |
|-----|-----------|-------|
| DQ-01 | Daily | Venues missing heroImage/hours |
| DQ-02 | Daily | Items missing price, empty categories |
| DQ-03 | Daily | Offers expiring within 7 days |
| DQ-04 | Weekly | Low conversion items |
| DQ-05 | Weekly | Broken asset URLs |
