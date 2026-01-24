# Testing Guide

This document describes the testing strategy and procedures for the DineIn monorepo.

---

## Overview

| Test Type | Tool | Location |
|-----------|------|----------|
| Unit Tests | Vitest | `packages/*/tests/` |
| E2E Tests | Playwright | `apps/*/tests/` |
| Manual QA | Browser | See critical flows |

---

## Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm --filter @dinein/core test
pnpm --filter @dinein/db test

# Watch mode
pnpm --filter @dinein/core test:watch
```

### E2E Tests

```bash
# Install Playwright browsers (first time)
cd apps/customer
pnpm exec playwright install

# Run all E2E tests
pnpm exec playwright test

# Run with UI
pnpm exec playwright test --ui

# Run specific test file
pnpm exec playwright test order-flow.spec.ts
```

---

## Critical Flows (Must Always Pass)

### 1. Customer Order Flow

**Steps:**
1. Open `/v/test-venue`
2. Menu loads with categories
3. Add item to cart
4. Open cart
5. Proceed to checkout
6. Place order
7. Order status shows "Placed"

**Tap Budget:** ≤4 taps from menu to order placed

```typescript
// apps/customer/tests/order-flow.spec.ts
test('customer can place order in 4 taps', async ({ page }) => {
  await page.goto('/v/test-venue')
  await page.click('[data-testid="menu-item-add"]')  // Tap 1: Add
  await page.click('[data-testid="cart-pill"]')      // Tap 2: Cart
  await page.click('[data-testid="checkout-btn"]')   // Tap 3: Checkout
  await page.click('[data-testid="place-order"]')    // Tap 4: Place
  await expect(page.locator('[data-testid="order-status"]')).toContainText('Placed')
})
```

### 2. Venue Order Management

**Steps:**
1. Login as venue owner
2. Navigate to Orders
3. New order appears
4. Mark as "Received"
5. Mark as "Served"

```typescript
// apps/venue/tests/order-management.spec.ts
test('venue owner can update order status', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'owner@test.com')
  await page.fill('[name="password"]', 'testpass')
  await page.click('[type="submit"]')
  
  await page.click('[data-testid="orders-tab"]')
  await page.click('[data-testid="order-card"]')
  await page.click('[data-testid="mark-received"]')
  await expect(page.locator('[data-testid="status"]')).toContainText('Received')
})
```

### 3. Admin Claim Approval

**Steps:**
1. Login as admin
2. Navigate to Claims
3. View unclaimed venues
4. Approve claim
5. Venue moves to claimed list

```typescript
// apps/admin/tests/claims.spec.ts
test('admin can approve venue claim', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'admin@dinein.com')
  await page.fill('[name="password"]', 'adminpass')
  await page.click('[type="submit"]')
  
  await page.click('[href="/claims"]')
  await page.click('[data-testid="approve-btn"]')
  await expect(page.locator('[data-testid="claimed-section"]')).toBeVisible()
})
```

---

## Test Configuration

### Playwright Config

```typescript
// apps/customer/playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
})
```

### Test Artifacts

```
apps/customer/
├── tests/
│   ├── order-flow.spec.ts
│   └── navigation.spec.ts
├── test-results/           # Screenshots, traces
└── playwright-report/      # HTML reports
```

---

## Browser Testing Matrix

### Required Viewports

| Viewport | Resolution | Device |
|----------|------------|--------|
| Mobile | 360×800 | Android Chrome |
| Mobile Large | 390×844 | iPhone 14 |
| Tablet | 768×1024 | iPad |
| Desktop | 1280×720 | Chrome |

### Manual Browser Checklist

- [ ] Chrome Mobile (360×800)
- [ ] Safari iOS (390×844)
- [ ] Chrome Desktop (1280×720)
- [ ] Firefox Desktop
- [ ] PWA installed (customer)

---

## RBAC Testing

### Access Control Verification

| Test | Expected |
|------|----------|
| Customer opens `/venue/dashboard` | Redirect to login |
| Customer opens `/admin` | Redirect to login |
| Venue owner opens `/admin` | Redirect to login |
| Staff tries admin API | 403 Forbidden |

### RLS Testing

```sql
-- Test as anonymous (public)
SET role anon;
SELECT * FROM vendors WHERE active = true;  -- ✅ Works
INSERT INTO orders (...);                    -- ❌ Denied

-- Test as authenticated user
SET role authenticated;
SELECT * FROM orders WHERE user_id = auth.uid();  -- ✅ Works
UPDATE orders SET status = 'Cancelled' WHERE user_id != auth.uid();  -- ❌ Denied
```

---

## Mobile-Specific Testing

### Touch Target Verification

All interactive elements must be ≥44×44px.

```typescript
test('touch targets are accessible', async ({ page }) => {
  await page.goto('/v/test-venue')
  const button = page.locator('[data-testid="menu-item-add"]')
  const box = await button.boundingBox()
  expect(box?.width).toBeGreaterThanOrEqual(44)
  expect(box?.height).toBeGreaterThanOrEqual(44)
})
```

### Slow Network Testing

```typescript
// Simulate 3G network
test('loads on slow network', async ({ page, context }) => {
  await context.route('**/*', async (route) => {
    await new Promise(r => setTimeout(r, 1000)) // Add latency
    await route.continue()
  })
  
  await page.goto('/v/test-venue')
  await expect(page.locator('[data-testid="menu"]')).toBeVisible({ timeout: 10000 })
})
```

---

## CI Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm build
      - run: pnpm lint
      
      - name: Install Playwright
        run: pnpm exec playwright install --with-deps
        working-directory: apps/customer
      
      - name: Run E2E tests
        run: pnpm exec playwright test
        working-directory: apps/customer
      
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: apps/customer/playwright-report/
```

---

## Debugging Failed Tests

### View Trace

```bash
pnpm exec playwright show-trace test-results/test-name/trace.zip
```

### Screenshot on Failure

Screenshots are automatically saved to `test-results/` on failure.

### Run in Debug Mode

```bash
pnpm exec playwright test --debug
```

### View HTML Report

```bash
pnpm exec playwright show-report
```
