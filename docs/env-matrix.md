# Environment Variables Matrix

This document lists all environment variables used across the DineIn monorepo.

---

## Quick Reference

| Scope | File Location | Secret? |
|-------|---------------|---------|
| App (client-safe) | `apps/{app}/.env` | No |
| App (local overrides) | `apps/{app}/.env.local` | Some |
| Supabase CLI | `supabase/.env` | **Yes** |

---

## Client-Side Variables (All Apps)

These are embedded at build time via Vite and exposed to the browser.

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes | None (fail-fast) |
| `VITE_SUPABASE_ANON_KEY` | Public anon key for client auth | Yes | None (fail-fast) |
| `VITE_ENV` | Environment identifier | No | `development` |

### Fail-Fast Behavior

All apps check for `VITE_SUPABASE_URL` on initialization:
- If missing: Console warning logged
- App uses mock/fallback Supabase client
- UI shows "data unavailable" state
- App does NOT crash

---

## App-Specific Variables

### Customer App (`apps/customer`)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Anon key | Yes |
| `VITE_ENV` | Environment | No |

### Venue Portal (`apps/venue`)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Anon key | Yes |
| `VITE_ENV` | Environment | No |

### Admin Portal (`apps/admin`)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Anon key | Yes |
| `VITE_ENV` | Environment | No |

---

## Server-Side Variables (Supabase CLI)

Located in `supabase/.env` — **NEVER COMMIT THIS FILE**.

| Variable | Description | Secret? |
|----------|-------------|---------|
| `SUPABASE_ACCESS_TOKEN` | Personal access token for CLI | **Yes** |
| `SUPABASE_PROJECT_REF` | Project ID (e.g., `elhlcdiosomutugpneoc`) | No |
| `SUPABASE_URL` | Project URL (same as client) | No |
| `SUPABASE_ANON_KEY` | Anon key (same as client) | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for Edge Functions | **Yes** |
| `DATABASE_URL` | Direct Postgres connection string | **Yes** |

---

## Cloudflare Pages Variables

Set in Cloudflare Pages dashboard for each app:

| Variable | Production | Preview |
|----------|------------|---------|
| `VITE_SUPABASE_URL` | Production Supabase URL | Same |
| `VITE_SUPABASE_ANON_KEY` | Production anon key | Same |
| `VITE_ENV` | `production` | `preview` |

---

## Security Rules

> [!CAUTION]
> **Never commit secrets to version control.**

### What's Already Git-Ignored

```
# Root .gitignore
apps/*/.env
apps/*/.env.local

# supabase/.gitignore
.env
```

### Secret Variables (Never Share)

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

### Safe to Share (Public)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_PROJECT_REF`

---

## Setup Checklist

### Local Development

1. Copy example env files:
   ```bash
   cp apps/customer/.env.example apps/customer/.env
   cp apps/venue/.env.example apps/venue/.env
   cp apps/admin/.env.example apps/admin/.env
   ```

2. Get Supabase credentials from dashboard:
   - Project Settings → API → Project URL
   - Project Settings → API → anon public key

3. For Supabase CLI operations:
   ```bash
   cp supabase/.env.example supabase/.env
   # Add your access token from supabase.com/dashboard/account/tokens
   ```

### Production (Cloudflare Pages)

1. Go to Cloudflare Dashboard → Pages → Your Project → Settings
2. Add environment variables under "Environment variables"
3. Set `VITE_ENV=production`
4. Redeploy to apply changes
