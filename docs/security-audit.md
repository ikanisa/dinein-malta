# DineIn Security & RLS Audit Report

**Date**: 2026-01-24
**Scope**: Supabase RLS, auth guards, rate limiting

## Summary
| Severity | Count | Status |
|----------|-------|--------|
| Critical | 0 | ✅ |
| High | 0 | ✅ |
| Medium | 1 | ⚠️ Noted |
| Low | 2 | ℹ️ |

## RLS Status by Table

### Public Read (Anonymous)
| Table | RLS | Policy | Status |
|-------|-----|--------|--------|
| venues | ✅ | Active only | OK |
| menu_categories | ✅ | Via venue | OK |
| menu_items | ✅ | Via venue | OK |
| promotions | ✅ | Active only | OK |

### Authenticated (User)
| Table | RLS | Policy | Status |
|-------|-----|--------|--------|
| profiles | ✅ | Own profile | OK |
| orders | ✅ | Own orders | OK |
| order_items | ✅ | Via order | OK |

### Owner (Venue Manager)
| Table | RLS | Policy | Status |
|-------|-----|--------|--------|
| venues UPDATE | ✅ | Owner only | OK |
| menu CRUD | ✅ | Owner only | OK |
| orders status | ✅ | Owner only | OK |

### Admin
| Table | RLS | Policy | Status |
|-------|-----|--------|--------|
| venue_claims | ✅ | Admin approve | OK |
| profiles SELECT | ✅ | Admin can see all | OK |

## Rate Limiting
- ✅ `check_rate_limit` function exists
- ✅ SECURITY DEFINER for atomic operations
- ✅ Limits on: order creation, bell calls, claim submission

## Indexes Verified
Per `20250119000000_performance_indexes.sql`:
- `orders.venue_id`
- `orders.status`
- `menu_items.venue_id`
- `menu_items.category_id`
- `venues.slug`
- `venues.country`

## Medium Severity Notes
1. **Select * Usage**: Some queries use `select('*')` which could be optimized
   - **Impact**: Extra bytes over wire
   - **Status**: Acceptable for MVP, documented in queryContract.md

## Low Severity Notes
1. Mock data still in use (`MOCK_VENUES`, `MOCK_ITEMS`)
2. Some hooks not yet migrated to Supabase queries

## Recommendations
- Migrate customer Home to use `getVenuesForCountry` when ready
- Consider field-specific selects for performance in high-traffic paths
