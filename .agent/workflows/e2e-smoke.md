---
description: Minimal end-to-end smoke tests for critical Staff/Admin flows (PWA-friendly)
---

# E2E Smoke Test Workflow

Run minimal end-to-end smoke tests to validate critical flows for Staff (Manager/Vendor) and Admin portals. These tests verify basic functionality without requiring authenticated sessions.

## Prerequisites

1. Local dev server running on port 5173
2. Playwright installed (`npm install` already done)

---

## Quick Commands

```bash
# Run only smoke tests (fastest - ~3min)
// turbo
cd apps/web && npx playwright test smoke.spec.ts --reporter=list

# Run all E2E tests on Chromium only (faster - ~2min per suite)
// turbo
cd apps/web && npx playwright test --project=chromium --reporter=list

# Run all E2E tests on all browsers (~10-15min)
// turbo
cd apps/web && npx playwright test --reporter=list
```

---

## Step-by-Step Workflow

### 1. Verify Dev Server is Running

// turbo
```bash
curl -s http://localhost:5173 > /dev/null && echo "✅ Dev server running" || echo "❌ Dev server not running"
```

If not running, start it:
```bash
cd apps/web && npm run dev
```

### 2. Run Core Smoke Tests

// turbo
```bash
cd apps/web && npx playwright test smoke.spec.ts --reporter=list
```

**Expected Outcome**: 12 tests pass (4 tests × 3 browsers)  
**Tests Covered**:
- Homepage loads without critical console errors
- Explore route is reachable
- Vendor login page is accessible
- Admin login page is accessible

### 3. Run Client Journey Tests

// turbo
```bash
cd apps/web && npx playwright test client-journey.spec.ts --project=chromium --reporter=list
```

**Expected Outcome**: 10 tests pass  
**Tests Covered**:
- Homepage loads and redirects correctly
- Settings page accessible
- Vendor menu page renders
- QR scan simulated table navigation
- Cart add/open functionality
- Order status page
- Bar onboarding page
- Cross-page navigation without errors
- Mobile responsive viewport

### 4. Run RBAC Security Tests

// turbo
```bash
cd apps/web && npx playwright test rbac-security.spec.ts --project=chromium --reporter=list
```

**Expected Outcome**: 7 tests pass  
**Tests Covered**:
- Unauthenticated access to admin dashboard shows login or spinner
- Unauthenticated access to manager dashboard shows login or spinner
- Unauthenticated access to admin users page protected
- Unauthenticated access to admin vendors page protected
- All admin routes require authentication
- All manager routes require authentication
- Evidence collection for protected route access

### 5. Run Vendor Journey Tests

// turbo
```bash
cd apps/web && npx playwright test vendor-journey.spec.ts --project=chromium --reporter=list
```

**Expected Outcome**: 11 tests pass  
**Tests Covered**:
- Vendor login page loads
- Vendor login form has required fields
- Invalid credentials show error
- Vendor dashboard is protected
- Menu management page structure
- Orders page loads
- Settings page accessible
- Menu items list structure
- Add menu item form
- Orders list or empty state
- Order status filtering

### 6. Run Admin Journey Tests

// turbo
```bash
cd apps/web && npx playwright test admin-journey.spec.ts --project=chromium --reporter=list
```

**Expected Outcome**: Tests should pass  
**Tests Covered**:
- Admin login page accessible
- Admin dashboard is protected
- Admin vendors page structure
- Admin users management page
- Admin settings page accessible
- Vendor list page loads
- Create vendor form structure
- Vendor discovery page loads
- Analytics dashboard loads
- Analytics date range filtering

---

## Test File Inventory

| File | Purpose | Tests |
|------|---------|-------|
| `smoke.spec.ts` | Basic app health checks | 4 |
| `client-journey.spec.ts` | Client/customer user flows | 10 |
| `rbac-security.spec.ts` | RBAC route protection | 7 |
| `vendor-journey.spec.ts` | Vendor/manager flows | 11 |
| `admin-journey.spec.ts` | Admin portal flows | 10 |
| `vendor-dashboard-new.spec.ts` | New vendor dashboard | TBD |
| `rbac-vendor-escalation.spec.ts` | Vendor to admin escalation | TBD |

---

## Troubleshooting

### Mobile Safari Tests Failing

Mobile Safari tests may fail due to:
1. PWA install prompt blocking locators
2. Server connection timeouts

**Fix**: Run with `--project=chromium` for faster, more reliable tests:
```bash
cd apps/web && npx playwright test --project=chromium
```

### Connection Refused Errors

If you see `net::ERR_CONNECTION_REFUSED`:

1. Check if dev server is running:
   ```bash
   lsof -i :5173
   ```

2. Restart dev server:
   ```bash
   # Kill existing Vite processes
   pkill -f "vite" || true
   
   # Start fresh
   cd apps/web && npm run dev
   ```

3. Wait 5 seconds and re-run tests

### View Test Reports

// turbo
```bash
cd apps/web && npx playwright show-report
```

### Debug Failing Tests

```bash
# Run in headed mode to see browser
cd apps/web && npx playwright test smoke.spec.ts --headed

# Run specific test with debug
cd apps/web && npx playwright test -g "home page loads" --debug
```

---

## CI Integration

For CI environments, use:

```bash
cd apps/web && npm run test:e2e
```

This runs tests with:
- `CI=true` retries (2 retries on failure)
- Single worker
- Production preview build

---

## Evidence Collection

Test failures save artifacts to `apps/web/test-results/`:
- `test-failed-*.png` - Screenshots on failure
- `*.webm` - Video recordings
- `error-context.md` - Error context

Review with:
// turbo
```bash
ls -la apps/web/test-results/
```