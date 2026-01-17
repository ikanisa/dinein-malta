# RBAC Security Test Checklist

Deterministic manual checklist for validating role-based access control before deployments.

## Pre-Deployment RBAC Verification

### 1. Unauthenticated Access Tests

| Route | Expected | Pass/Fail |
|-------|----------|-----------|
| `/#/admin/dashboard` | Redirect to `/admin/login` | ☐ |
| `/#/admin/vendors` | Redirect to `/admin/login` | ☐ |
| `/#/admin/users` | Redirect to `/admin/login` | ☐ |
| `/#/admin/orders` | Redirect to `/admin/login` | ☐ |
| `/#/admin/system` | Redirect to `/admin/login` | ☐ |
| `/#/vendor/dashboard` | Redirect to `/vendor/login` | ☐ |
| `/#/vendor/dashboard/orders` | Redirect to `/vendor/login` | ☐ |
| `/#/vendor/dashboard/menu` | Redirect to `/vendor/login` | ☐ |

### 2. Legacy Route Protection

| Route | Expected | Pass/Fail |
|-------|----------|-----------|
| `/#/admin-dashboard` | Redirect to `/admin/login` | ☐ |
| `/#/admin-vendors` | Redirect to `/admin/login` | ☐ |
| `/#/admin-users` | Redirect to `/admin/login` | ☐ |
| `/#/vendor-dashboard` | Redirect to `/vendor/login` | ☐ |

### 3. Role Escalation Prevention

**As Vendor (logged in as vendor user):**

| Action | Expected | Pass/Fail |
|--------|----------|-----------|
| Navigate to `/#/admin/dashboard` | Redirect to admin login | ☐ |
| Navigate to `/#/admin/users` | Redirect to admin login | ☐ |
| Navigate to `/#/admin/vendors` | Redirect to admin login | ☐ |

### 4. API-Level RBAC (Direct Supabase)

> [!NOTE]
> These tests require browser dev tools or API testing tool.

| Test | Method | Expected |
|------|--------|----------|
| Vendor fetching all admin_users | Supabase select | Empty result (RLS blocked) |
| Vendor updating other vendor's menu | Supabase update | Error / no rows affected |
| Client fetching vendor_users | Supabase select | Empty result (RLS blocked) |

---

## How to Test

1. **Open incognito browser**
2. **Navigate to each route in table above**
3. **Verify redirect behavior**
4. **Log pass/fail in checkbox**

## Automated Alternative

```bash
cd apps/web && npm run test:e2e -- --grep "RBAC"
```

---

## Sign-Off

| Tester | Date | All Passed |
|--------|------|------------|
| _______ | ______ | ☐ Yes / ☐ No |
