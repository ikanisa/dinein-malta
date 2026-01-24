# Cloudflare Pages Deployment Guide

## Project Structure

| App | Cloudflare Project | Custom Domain |
|-----|-------------------|---------------|
| `apps/customer` | `dinein-customer` | `dinein.ikanisa.com` |
| `apps/venue` | `dinein-venue` | `venue.dinein.ikanisa.com` |
| `apps/admin` | `dinein-admin` | `admin.dinein.ikanisa.com` |

---

## Step 1: Create Cloudflare Pages Projects

For each app, run:

```bash
# Customer
cd apps/customer && pnpm build
npx wrangler pages project create dinein-customer

# Venue
cd apps/venue && pnpm build
npx wrangler pages project create dinein-venue

# Admin
cd apps/admin && pnpm build
npx wrangler pages project create dinein-admin
```

---

## Step 2: Set Environment Variables

In [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → each project → Settings → Environment variables:

| Variable | Value | Encrypt |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | `https://elhlcdiosomutugpneoc.supabase.co` | No |
| `VITE_SUPABASE_ANON_KEY` | (your anon key) | **Yes** |

> ⚠️ Set for both **Production** and **Preview** environments.

---

## Step 3: Configure Custom Domains

In Cloudflare Dashboard → Pages → each project → Custom domains:

1. **dinein-customer**: Add `dinein.ikanisa.com`
2. **dinein-venue**: Add `venue.dinein.ikanisa.com`
3. **dinein-admin**: Add `admin.dinein.ikanisa.com`

Cloudflare will auto-configure DNS if `ikanisa.com` is on Cloudflare DNS.

---

## Step 4: Deploy

From monorepo root:

```bash
# Deploy all
pnpm deploy:all

# Or individually
pnpm deploy:customer
pnpm deploy:venue
pnpm deploy:admin
```

---

## Verification Checklist

- [ ] `dinein.ikanisa.com` loads customer app
- [ ] `venue.dinein.ikanisa.com` loads venue login
- [ ] `admin.dinein.ikanisa.com` loads admin login
- [ ] PWA install prompt works on mobile
- [ ] Supabase auth flows work

---

## Rollback

```bash
# List deployments
npx wrangler pages deployment list --project-name dinein-customer

# Rollback to previous
npx wrangler pages deployment rollback --project-name dinein-customer
```
