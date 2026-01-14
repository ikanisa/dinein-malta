# API Integration Guide

## Overview

All frontend components use React Query for data fetching and state management. The app uses Supabase as the backend with Edge Functions for secure operations.

## Key Files

| File | Purpose |
|------|---------|
| `services/api.ts` | Centralized API with `APIError` class |
| `services/databaseService.ts` | Core Supabase functions (50+ methods) |
| `hooks/useVendors.ts` | Vendor queries |
| `hooks/useMenuItems.ts` | Menu CRUD with mutations |
| `hooks/useOrders.ts` | Order management |
| `hooks/useTables.ts` | Table queries |
| `hooks/useReservations.ts` | Reservation management |

## React Query Hooks

### Vendors
```typescript
import { useVendors, useVendor } from '@/hooks/useVendors';

// Get all vendors
const { data: vendors, isLoading, error } = useVendors();

// Get single vendor by slug
const { data: vendor } = useVendor('my-restaurant');
```

### Menu Items
```typescript
import { useMenuItems, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem } from '@/hooks/useMenuItems';

// Get menu items for vendor
const { data: items } = useMenuItems(vendorId);

// Create mutation
const createMutation = useCreateMenuItem(vendorId);
createMutation.mutate({ name: 'Burger', price: 12.99, ... });
```

### Orders
```typescript
import { useOrders, useCreateOrder, useUpdateOrderStatus } from '@/hooks/useOrders';

// Get orders for vendor
const { data: orders } = useOrders(vendorId);

// Create order
const createOrder = useCreateOrder();
createOrder.mutate({ venueId, tablePublicCode, items, ... });
```

## Error Handling

All API calls use the `APIError` class:
```typescript
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) { ... }
}
```

## Caching Strategy

| Data Type | Stale Time | Notes |
|-----------|------------|-------|
| Vendors | 5 min | Semi-static |
| Menu Items | 5 min | Changes infrequently |
| Orders | 30 sec | Near real-time needed |
| Reservations | 2 min | Moderate updates |

## Loading States

Use skeleton components from `components/Loading.tsx`:
- `Skeleton` - Base component with variants
- `CardSkeleton` - Venue cards
- `MenuItemSkeleton` - Menu items
- `OrderCardSkeleton` - Orders
- `VendorCardSkeleton` - Vendor cards

## Utility Scripts

```bash
# Search for mock data patterns
./scripts/find_mock_data.sh

# Remove console.log statements
./scripts/remove_console_logs.sh
```

## Best Practices

1. **Always use hooks** from `hooks/` for data fetching
2. **Handle all states**: loading, error, empty, success
3. **Use skeleton loaders** for better perceived performance
4. **Wrap pages** in `ErrorBoundary` for crash protection
5. **Haptic feedback** is automatic via mutations
