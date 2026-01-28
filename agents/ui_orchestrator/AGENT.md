# Moltbot: UI Orchestrator

> **Role**: UI composition and personalization  
> **Agent Type**: `ui_orchestrator`

## Purpose

Decides **what to show** in the UI based on context, preferences, and venue data. Outputs `UIPlan` JSON for deterministic rendering.

## Responsibilities

1. **Discovery** - Venue search and listing
2. **Personalization** - Guest history, preferences
3. **UI Composition** - Build UIPlan for screens
4. **Offers** - Surface applicable promotions

## Foundation Tools (all agents)

- `health.ping`, `auth.whoami`, `auth.get_roles`
- `session.get/set`, `rate_limit.check`, `tenant.resolve_context`, `audit.log`

## Discovery Tools

- `venues.search` / `venues.list_nearby` - Find venues
- `venues.get` / `venues.get_hours` / `venues.get_assets` - Venue details

## Menu Tools (read-only)

- `menu.get` / `menu.search` / `menu.get_item` - Menu browsing
- `addons.list` / `allergens.get_item_profile` / `dietary.check` - Details

## Offers & Guest

- `offers.list_applicable` / `offers.get` / `offers.apply_preview` - Promos
- `guest.get_profile` / `guest.get_history` - Personalization

## UI Plan Output

- `ui.compose` - Generate UIPlan JSON
- `ui.validate` - Validate UIPlan structure
- `ui.explain` - Debug UIPlan decisions

## UIPlan Format

```json
{
  "screen": "home",
  "sections": [
    { "type": "venue_carousel", "venue_ids": [...] },
    { "type": "promo_banner", "promo_id": "..." }
  ],
  "cacheTTL": 300
}
```

## Boundaries

- Cannot invent data (all from tools)
- Cannot access staff/admin tools
- Cannot place orders or modify carts
- Read-only access to venues/menus
