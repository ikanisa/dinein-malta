# Supabase Backend Setup

Complete guide for setting up and deploying the Supabase backend (database, edge functions, and RLS policies).

## Overview

The DineIn Malta backend runs on Supabase and includes:
- PostgreSQL database with Row-Level Security (RLS)
- Edge Functions for server-side logic
- Authentication (Anonymous, Email/Password, Google OAuth)
- Real-time subscriptions

## Prerequisites

- Supabase account ([Sign up](https://supabase.com))
- Supabase CLI (optional, for local development)

## Quick Start

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for project to be provisioned

### 2. Get Project Credentials

From Supabase Dashboard → Settings → API:

- **Project URL** → Use as `VITE_SUPABASE_URL`
- **anon/public key** → Use as `VITE_SUPABASE_ANON_KEY`
- **service_role key** → Keep secret (server-side only)

## Database Migrations

### Apply Migrations via Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Open each migration file from `supabase/migrations/`
3. Run migrations in chronological order (by timestamp)

**Migration Order:**
```
1. 20251216131852_dinein_v1_schema.sql
2. 20250120000000_phase1_rls_performance_fix.sql
3. ... (other migrations in order)
```

### Apply Migrations via CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Verify Migrations Applied

Check in Supabase Dashboard → Database → Migrations to see applied migrations.

## Edge Functions

Edge Functions handle server-side logic like order processing, AI features, and admin operations.

### Deploy All Functions

```bash
supabase functions deploy --project-ref your-project-ref
```

### Deploy Individual Functions

```bash
# AI features (Gemini integration)
supabase functions deploy gemini-features --project-ref your-project-ref

# Order management
supabase functions deploy order_create --project-ref your-project-ref
supabase functions deploy order_update_status --project-ref your-project-ref
supabase functions deploy order_mark_paid --project-ref your-project-ref

# Vendor operations
supabase functions deploy vendor_claim --project-ref your-project-ref
supabase functions deploy tables_generate --project-ref your-project-ref

# Location search
supabase functions deploy nearby_places_live --project-ref your-project-ref

# Admin (migrations)
supabase functions deploy apply_migrations --project-ref your-project-ref
```

### Edge Function Environment Variables

Set environment variables in Supabase Dashboard:

1. Go to Project Settings → Edge Functions → Environment Variables
2. Add:
   - `GEMINI_API_KEY` - Required for AI features (server-side only)

**Getting GEMINI_API_KEY:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Add to Supabase edge function environment variables

## Authentication Setup

### Anonymous Authentication

Required for public client access:

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **Anonymous** provider
3. Save settings

### Email/Password Authentication

Required for vendor login:

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **Email** provider
3. Configure email templates (optional)
4. Save settings

### Google OAuth

Required for admin login:

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **Google** provider
3. Add OAuth credentials:
   - Client ID (from Google Cloud Console)
   - Client Secret (from Google Cloud Console)
4. Add redirect URL: `https://your-domain.com/admin/dashboard`
5. Save settings

**Setting up Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `https://your-domain.com/admin/dashboard`

## Row-Level Security (RLS)

RLS policies enforce data access at the database level. All tables have RLS enabled.

### Verify RLS Policies

Run the verification script to check all RLS policies:

```bash
# Via Supabase CLI
supabase db execute -f supabase/scripts/verify_rls_status.sql --project-ref your-project-ref

# Or via Dashboard
# Go to SQL Editor and paste contents of supabase/scripts/verify_rls_status.sql
```

### What the Verification Script Checks

1. **RLS Enabled**: Verifies RLS is enabled on all required tables
2. **Policy Existence**: Lists all policies with their definitions
3. **Missing Policies**: Identifies tables without policies (security risk)
4. **Expected Policies**: Verifies all expected policies exist
5. **Anonymous Access**: Checks for proper anonymous access patterns

### Expected Tables with RLS

- `admin_users` - Admin user management
- `vendors` - Vendor/venue information
- `vendor_users` - Vendor staff accounts
- `menu_items` - Menu items
- `tables` - QR code tables
- `orders` - Customer orders
- `order_items` - Order line items
- `reservations` - Table reservations
- `profiles` - User profiles
- `audit_logs` - System audit logs
- `api_rate_limits` - Rate limiting

### Policy Categories

1. **Select Policies**: Control read access
2. **Insert Policies**: Control creation of records
3. **Update Policies**: Control modifications
4. **Delete Policies**: Control record deletion

### Testing RLS

1. Test as anonymous user (should only see active vendors/menus)
2. Test as vendor user (should only see their own data)
3. Test as admin user (should see all data)

## Storage Setup

Storage buckets are configured via migrations. Verify buckets exist:

1. Go to Supabase Dashboard → Storage
2. Check for buckets:
   - `venue-images` - Vendor/venue images
   - Other buckets as needed

## Initial Data

### Create Admin User

Run the helper script:

```bash
# Via SQL Editor in Dashboard
# Copy contents of: supabase/migrations/20250121000000_create_admin_user_helper.sql
```

Or create manually via Dashboard → Table Editor → `admin_users`.

### Seed Data (Optional)

Seed vendors and menu items:

```bash
cd scripts
npm install
npm run seed-vendors
npm run seed-menu
```

## Monitoring

### Database Monitoring

1. Go to Supabase Dashboard → Database → Reports
2. Monitor:
   - Query performance
   - Database size
   - Connection counts

### Edge Function Logs

1. Go to Supabase Dashboard → Edge Functions → Logs
2. Monitor function execution and errors

### RLS Policy Effectiveness

Review `audit_logs` table for access patterns and security events.

## Backup & Recovery

### Automatic Backups

Supabase provides automatic daily backups on paid plans.

### Manual Backup

```bash
# Export database
supabase db dump --project-ref your-project-ref > backup.sql
```

### Restore

```bash
# Restore from backup
supabase db reset --project-ref your-project-ref
# Then apply backup.sql via SQL Editor
```

## Security Checklist

- [ ] All tables have RLS enabled
- [ ] All tables have appropriate policies
- [ ] Service role key is kept secret (never in client code)
- [ ] Edge function environment variables are set
- [ ] Anonymous access is properly restricted
- [ ] Admin users are properly configured
- [ ] OAuth redirect URLs are correctly configured

## Troubleshooting

### Migration Fails

- Check migration order (run chronologically)
- Verify SQL syntax
- Check for conflicting constraints

### RLS Policies Not Working

- Verify RLS is enabled: `SELECT relrowsecurity FROM pg_class WHERE relname = 'table_name';`
- Check policy expressions in SQL Editor
- Test with different user roles

### Edge Functions Not Deploying

- Check Supabase CLI is updated: `supabase --version`
- Verify project ref is correct
- Check function logs for errors

### Authentication Issues

- Verify providers are enabled in Dashboard
- Check OAuth redirect URLs match exactly
- Review authentication logs in Dashboard

## Next Steps

- [Cloudflare Pages Deployment](./cloudflare-pages.md)
- [Local Development](./local-development.md)
- [Troubleshooting](./troubleshooting.md)

---

**Need help?** Check Supabase docs: https://supabase.com/docs
