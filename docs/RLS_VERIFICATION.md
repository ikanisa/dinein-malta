# Row Level Security (RLS) Policy Verification

This document provides instructions for verifying RLS policies are correctly configured in the Supabase database.

## Verification Script

The verification script is located at: `supabase/scripts/verify_rls_status.sql`

## How to Run Verification

### Option 1: Supabase Dashboard (Recommended)

1. Log into your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open a new query
4. Copy and paste the entire contents of `supabase/scripts/verify_rls_status.sql`
5. Click **Run** (or press Cmd/Ctrl + Enter)

### Option 2: Supabase CLI

```bash
supabase db execute -f supabase/scripts/verify_rls_status.sql
```

## What the Script Checks

### 1. RLS Status on Critical Tables
Verifies that RLS is enabled on all security-sensitive tables:
- `admin_users`
- `vendors`
- `vendor_users`
- `menu_items`
- `tables`
- `orders`
- `order_items`
- `reservations`
- `profiles`
- `audit_logs`
- `api_rate_limits`

### 2. Policy Inventory
Lists all existing RLS policies with their definitions, operations, and expressions.

### 3. Tables Without Policies
Identifies any tables with RLS enabled but no policies defined (security risk).

### 4. Expected Policy Verification
Checks for the presence of expected policies:
- Admin policies (admin_users_select, admin_users_write)
- Vendor policies (vendors_select, vendors_update, etc.)
- Public/Anonymous policies (vendors_anon_select_active, menu_items_anon_select_active)
- Order policies (orders_select, orders_update_vendor)
- Profile policies (profiles_select_own, profiles_update_own)
- Audit log policies (audit_logs_admin_select, audit_logs_service_insert)
- Rate limit policies (api_rate_limits_select_own, etc.)

### 5. Anonymous Access Verification
Identifies policies that allow anonymous access for public discovery features.

## Expected Results

When all policies are correctly configured, you should see:
- ✅ All critical tables have RLS enabled
- ✅ All expected policies exist
- ✅ No tables with RLS enabled but no policies
- ✅ Anonymous access policies present for vendors and menu_items

## Common Issues

### Tables Without Policies
If a table shows "No policies defined!", you need to:
1. Check if the table should have RLS enabled
2. Create appropriate policies in a migration
3. Apply the migration

### Missing Expected Policies
If expected policies are missing:
1. Review the migration files in `supabase/migrations/`
2. Ensure all migrations have been applied
3. Create a new migration to add missing policies

### RLS Disabled
If RLS is disabled on a critical table:
1. Enable RLS: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. Create appropriate policies
3. Test access control thoroughly

## Frequency

Recommended verification frequency:
- **Before Production Deployment**: Always
- **After Adding New Tables**: Immediately
- **After Policy Changes**: Immediately
- **Quarterly**: Regular audit

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Production Readiness Checklist](./production-readiness.md)
- [Database Schema Documentation](./DATABASE_SCHEMA.md)
