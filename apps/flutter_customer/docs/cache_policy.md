# Flutter Customer App - Cache Policy

## Overview
To support an "Offline-First" experience and instant cold starts, we implement aggressive caching for Venues and Menus.

## Keys & Namespaces
- **Venues**: `venue_{slug}` (Individual Venue Details)
- **Menus**: `menu_{venueId}` (Full Menu for a Venue)
- **Venue List**: `venues_list_{country}` (Home Feed)
- **Orders**: `my_orders` (History)

## TTL (Time-To-Live) Policy
| Data Type | TTL | Rationale |
| :--- | :--- | :--- |
| **Venues List** | 1 Hour | List changes slowly; fresh data fetched in background. |
| **Venue Details** | 6 Hours | Venue metadata (name, amenities) is stable. |
| **Menu** | 30 Minutes | Items/Prices change more frequently but not min-by-min. |
| **Orders** | Forever | History should persist until explicitly cleared. |

## Size Limits & Eviction (LRU)
- **Max Cached Venues**: 300
- **Max Cached Menus**: 50
- **Strategy**: Least Recently Used (LRU). When limit is reached, older entries are removed to free space.

## Stale-While-Revalidate
Repositories return cached data *immediately* if available (even if expired but usable), then fetch fresh data from network.
- If network succeeds -> Update Cache -> Emit Fresh Data.
- If network fails -> Keep showing Cached Data (with optional "Offline" indicator).
