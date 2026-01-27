# DineIn E2E Tests

End-to-end tests for the DineIn monorepo using Playwright.

## Quick Start

### Prerequisites

1. Install dependencies:
   ```bash
   pnpm install
   npx playwright install
   ```

2. Start the apps you want to test:
   ```bash
   # In separate terminals:
   pnpm dev:customer   # localhost:5173
   pnpm dev:venue      # localhost:5174
   pnpm dev:admin      # localhost:5175
   ```

### Running Tests

```bash
# From repo root
cd tests/e2e

# Run all tests
npx playwright test

# Run specific project
npx playwright test --project=customer
npx playwright test --project=venue
npx playwright test --project=admin

# Run with browser visible
npx playwright test --headed

# Run specific spec
npx playwright test specs/01_customer_order.spec.ts

# Show HTML report after run
npx playwright show-report
```

## Test Structure

```
tests/e2e/
├── fixtures/
│   ├── selectors.ts    # Test IDs from @dinein/core
│   └── testData.ts     # Demo venues, users, routes
├── specs/
│   ├── 01_customer_order.spec.ts      # Customer ordering journey
│   ├── 02_venue_orders_and_bell.spec.ts   # Venue order management
│   └── 03_admin_claim_approval.spec.ts    # Admin claim workflow
├── utils/
│   ├── auth.ts         # Login helpers
│   └── wait.ts         # Wait/retry utilities
├── playwright.config.ts
└── README.md
```

## Test Data

Tests use seeded demo data. Ensure these exist in your local/staging DB:

| Entity | Value |
|--------|-------|
| RW Demo Venue | `kigali-cafe` |
| MT Demo Venue | `valletta-bistro` |
| Venue Owner | `owner_demo@dinein.test` / pin `1234` |
| Admin | `admin_demo@dinein.test` |
| Claimant | `claimant_demo@dinein.test` / pin `1234` |

## Staging Tests

Run against staging:
```bash
E2E_ENV=staging npx playwright test
```

Or set custom URLs:
```bash
CUSTOMER_STAGING_URL=https://my-customer.pages.dev npx playwright test --project=customer
```

## Adding Test IDs

Test IDs are centralized in `packages/core/src/testids.ts`.

To add a new test ID:

1. Add to `testids.ts`:
   ```ts
   export const CUSTOMER_TESTIDS = {
       NEW_FEATURE: {
           PAGE: 'new-feature:page',
           BUTTON: 'new-feature:button',
       },
   };
   ```

2. Add to component:
   ```tsx
   import { TESTIDS } from '@dinein/core';
   
   <div data-testid={TESTIDS.CUSTOMER.NEW_FEATURE.PAGE}>
       <button data-testid={TESTIDS.CUSTOMER.NEW_FEATURE.BUTTON}>
           Click me
       </button>
   </div>
   ```

3. Use in test:
   ```ts
   import { CUSTOMER } from '../fixtures/selectors';
   
   test('new feature works', async ({ page }) => {
       await page.getByTestId(CUSTOMER.NEW_FEATURE.BUTTON).click();
   });
   ```

## Debugging Flaky Tests

1. **Run with trace**: Tests already capture traces on first retry
2. **View trace**: `npx playwright show-trace test-results/*/trace.zip`
3. **Run single test headed**: `npx playwright test --headed -g "test name"`
4. **Use Playwright Inspector**: `PWDEBUG=1 npx playwright test`

## CI Integration

Tests run in CI with:
- Single worker for determinism
- 1 retry to catch flakes
- HTML report + traces on failure

See `.github/workflows/e2e.yml` for CI config.
