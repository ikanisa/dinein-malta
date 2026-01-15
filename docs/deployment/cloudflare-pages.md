# Cloudflare Pages Deployment

Complete guide for deploying the DineIn Malta PWA to Cloudflare Pages (production deployment).

## Overview

Cloudflare Pages is the recommended production deployment platform for the DineIn Malta PWA. It provides:
- ✅ Automatic CI/CD deployments
- ✅ Global CDN
- ✅ Preview deployments for pull requests
- ✅ Free tier available
- ✅ Built-in analytics

## Initial Setup

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

This will open a browser window to authenticate with Cloudflare.

### 3. Get Your Account ID

```bash
wrangler whoami
```

Or find it in Cloudflare Dashboard → Right sidebar → Account ID

## Environment Variables

Set these in Cloudflare Pages Dashboard → Settings → Environment Variables:

**Required Variables:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**Important:** `GEMINI_API_KEY` is **NOT** needed in Cloudflare Pages. It's only used server-side in Supabase edge functions.

### Setting Environment Variables

1. Go to Cloudflare Dashboard → Pages → Your Project → Settings → Environment Variables
2. Add variables for both **Production** and **Preview** environments
3. Use `VITE_` prefix for all Vite environment variables

## Build Configuration

### Recommended Settings

In Cloudflare Pages Dashboard → Settings → Builds:

- **Framework preset**: `Vite`
- **Root directory**: `apps/web`
- **Build command**: `npm ci --legacy-peer-deps && npm run build`
- **Build output directory**: `dist`
- **Node version**: `20`

### Alternative Build Command

If `npm ci` fails, use:

```bash
npm install --legacy-peer-deps && npm run build
```

## Automatic CI/CD

The GitHub Actions workflow (`.github/workflows/cloudflare-pages.yml`) automatically deploys on every push to `main`.

### Setup GitHub Secrets

1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
   - `VITE_SUPABASE_URL` - Supabase URL
   - `VITE_SUPABASE_ANON_KEY` - Supabase anon key

**Creating Cloudflare API Token:**
1. Go to Cloudflare Dashboard → My Profile → API Tokens
2. Create token with "Edit Cloudflare Workers" and "Read Account" permissions
3. Copy token and add to GitHub Secrets

### Manual Workflow Trigger

- Go to GitHub repo → Actions → "Deploy to Cloudflare Pages" → Run workflow

## Manual Deployment

If you need to deploy manually:

```bash
cd apps/web

# Install dependencies
npm ci --legacy-peer-deps

# Build
npm run build

# Deploy
wrangler pages deploy dist --project-name=dinein-malta
```

Or use the deployment script:

```bash
cd apps/web
./deploy-cloudflare.sh
```

## Preview Deployments

All pull requests automatically get preview URLs in Cloudflare Pages. Preview branches use preview environment variables.

**Features:**
- Each PR gets a unique preview URL
- Preview environment variables are isolated
- Perfect for testing before merging

## SPA Routing

The `_redirects` file in `apps/web/public/` handles SPA routing:

```
/*    /index.html   200
```

This is automatically handled by Cloudflare Pages for SPAs. Ensure the file is copied to `dist/` during build.

## Custom Domain

### Setup

1. Go to Cloudflare Pages → Your Project → Custom domains
2. Add your domain
3. Update DNS records as instructed
4. SSL certificate is auto-provisioned

### DNS Configuration

Cloudflare will provide the DNS records to add. Typically:
- CNAME record pointing to your Cloudflare Pages domain
- Or A record with provided IP address

## Performance Optimization

The `vite.config.ts` is optimized for Cloudflare Pages:

- ✅ Code splitting (React, Framer Motion, Supabase)
- ✅ Minification (esbuild)
- ✅ Tree shaking
- ✅ Asset optimization
- ✅ Service worker caching

### Bundle Size Targets

- Main bundle: < 200KB
- Total assets: < 1MB
- Initial load: < 3 seconds

### Check Bundle Size

```bash
cd apps/web
npm run build
du -sh dist
```

For detailed analysis:
```bash
scripts/analyze-bundle.sh
```

## Rollback Procedures

### When to Rollback

Rollback immediately if any of these occur after deployment:

| Symptom | Action |
|---------|--------|
| App crashes on load (white screen) | Rollback |
| Login/auth broken | Rollback |
| Core user flow broken (ordering, checkout) | Rollback |
| Major console errors affecting most users | Rollback |
| Page load > 5 seconds (was < 2s before) | Rollback |

### Rollback Steps (< 2 minutes)

1. **Open Cloudflare Dashboard:**
   Navigate to: **Cloudflare Dashboard → Pages → dinein-malta → Deployments**

2. **Find Last Working Deployment:**
   - Look for the deployment BEFORE the broken one
   - Should have a green checkmark (✓)
   - Verify the timestamp matches "last known good"

3. **Rollback:**
   - Click the **⋮** (three dots) menu on the deployment row
   - Select **"Rollback to this deployment"**
   - Confirm the action

4. **Verify:**
   - Wait ~30 seconds for propagation
   - Hard refresh the production URL (`Cmd+Shift+R`)
   - Confirm the app works

5. **Notify Team:**
   Post in team channel with details of the rollback

### Post-Rollback

1. **Do not re-deploy** until root cause is identified
2. Check Cloudflare build logs for errors
3. Test fix in Preview environment before Production
4. Create incident report if user-impacting

**Note:** Cloudflare Pages retains 500 deployments. Rollback is instant (CDN edge update, no rebuild).

## Monitoring & Analytics

### Cloudflare Analytics

1. Go to Cloudflare Dashboard → Pages → Your Project
2. View Analytics tab for:
   - Page views
   - Unique visitors
   - Performance metrics
   - Error rates

### Web Vitals

The app includes Web Vitals tracking. Check browser console for metrics.

### Error Tracking

Sentry is configured for production error tracking. Verify it's working in production.

## Security

### Headers

Cloudflare automatically adds security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### Custom Headers

Add to `_headers` file in `apps/web/public/`:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Cost

Cloudflare Pages is **free** for:
- Unlimited requests
- Unlimited bandwidth
- Unlimited deployments
- 500 builds/month

For higher limits, upgrade to Pro ($20/month).

## Quick Reference

```bash
# Login
wrangler login

# Create project
wrangler pages project create dinein-malta

# Build
cd apps/web && npm run build

# Deploy
wrangler pages deploy dist --project-name=dinein-malta

# List deployments
wrangler pages deployment list --project-name=dinein-malta

# View logs
wrangler pages deployment tail --project-name=dinein-malta
```

## Support

- **Cloudflare Docs**: https://developers.cloudflare.com/pages
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler
- **Community**: https://community.cloudflare.com

---

**Next:** [Local Development](./local-development.md) | [Supabase Setup](./supabase-setup.md) | [Troubleshooting](./troubleshooting.md)
