# End-to-End Testing Guide

This document covers E2E testing practices for the DineIn monorepo.

## Overview

We use [Playwright](https://playwright.dev/) for E2E tests. Tests cover three critical user journeys:

| Spec | Journey | App |
|------|---------|-----|
| `01_customer_order` | Deep link → Menu → Cart → Checkout → Order | Customer |
| `02_venue_orders_and_bell` | Login → Orders → Status Update → Bell | Venue |
| `03_admin_claim_approval` | Login → Claims → Approve/Reject | Admin |

## Quick Start

```bash
# Install Playwright browsers
npx playwright install

# Start apps (in separate terminals)
pnpm dev:customer   # localhost:5173
pnpm dev:venue      # localhost:5174
pnpm dev:admin      # localhost:5175

# Run E2E tests
pnpm e2e              # All tests
pnpm e2e:customer     # Customer tests only
pnpm e2e:venue        # Venue tests only
pnpm e2e:admin        # Admin tests only
```

## Test Structure

```
tests/e2e/
├── fixtures/
│   ├── selectors.ts    # Test IDs from @dinein/core
│   └── testData.ts     # Demo data (venues, users)
├── specs/              # Test specifications
├── utils/
│   ├── auth.ts         # Login helpers
│   └── wait.ts         # Wait utilities
└── playwright.config.ts
```

## Test IDs

We use `data-testid` attributes for stable selectors. All IDs are centralized in `packages/core/src/testids.ts`.

### Adding Test IDs

1. Add to `testids.ts`:
```ts
export const CUSTOMER_TESTIDS = {
    MY_FEATURE: {
        PAGE: 'my-feature:page',
        BUTTON: 'my-feature:button',
    },
};
```

2. Use in component:
```tsx
import { TESTIDS } from '@dinein/core';
<div data-testid={TESTIDS.CUSTOMER.MY_FEATURE.PAGE}>
```

3. Use in test:
```ts
import { CUSTOMER } from '../fixtures/selectors';
await page.getByTestId(CUSTOMER.MY_FEATURE.PAGE);
```

## Test Data

Tests use seeded demo data:

| Entity | Identifier |
|--------|------------|
| RW Venue | `kigali-cafe` |
| MT Venue | `valletta-bistro` |
| Venue Owner | `owner_demo@dinein.test` / `1234` |
| Admin | `admin_demo@dinein.test` |

## Running on Staging

```bash
E2E_ENV=staging pnpm e2e
```

## Debugging

```bash
# Run with visible browser
pnpm e2e -- --headed

# Run single test
pnpm e2e -- -g "test name"

# Open Playwright Inspector
PWDEBUG=1 pnpm e2e

# View report
pnpm --filter e2e-tests report
```

## CI

Tests run automatically on push. Artifacts (traces, screenshots) are saved on failure.

## Scope Guard

Tests verify scope boundaries are respected:
- ❌ No delivery features
- ❌ No payment verification
- ❌ No in-app scanner
- ✅ Order statuses: Placed/Received/Served/Cancelled only
- ✅ Customer nav: 2 tabs only
