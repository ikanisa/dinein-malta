# Cloudflare Pages Deployment Guide

Complete guide for deploying DineIn Malta PWA to Cloudflare Pages.

## Prerequisites

1. **Cloudflare Account** - Sign up at https://dash.cloudflare.com
2. **Wrangler CLI** - Cloudflare's CLI tool
3. **Node.js 20+** - For building the application
4. **GitHub Account** - For CI/CD (optional but recommended)

---

## Quick Start

### Option 1: Automated Script (Recommended)

```bash
cd apps/web
chmod +x deploy-cloudflare.sh
./deploy-cloudflare.sh
```

### Option 2: Manual Deployment

```bash
cd apps/web

# Install dependencies
npm ci --legacy-peer-deps

# Build
npm run build

# Deploy
wrangler pages deploy dist --project-name=dinein-malta
```

---

## Initial Setup

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate with Cloudflare.

### 3. Get Your Account ID

```bash
wrangler whoami
```

Or find it in Cloudflare Dashboard → Right sidebar → Account ID

---

## Environment Variables

Set these in Cloudflare Pages Dashboard or via CLI:

### Required Variables

```bash
VITE_SUPABASE_URL=https://elhlcdiosomutugpneoc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaGxjZGlvc29tdXR1Z3BuZW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDU3NTMsImV4cCI6MjA3NDQ4MTc1M30.d92ZJG5E_9r7bOlRLBXRI6gcB_7ERVbL-Elp7fk4avY
```

### Optional Variables

```bash
GEMINI_API_KEY=your_gemini_api_key  # Only if needed client-side
```

### Setting via Cloudflare Dashboard

1. Go to Cloudflare Dashboard → Pages → Your Project
2. Settings → Environment Variables
3. Add variables for Production, Preview, and Development

### Setting via Wrangler

```bash
wrangler pages project create dinein-malta
```

Then set variables in dashboard (Wrangler doesn't support setting Pages env vars via CLI yet).

---

## Build Configuration

### Cloudflare Pages Auto-Detection

Cloudflare Pages automatically detects Vite projects. The build configuration is:

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `apps/web` (if deploying from monorepo)

### Custom Build Settings

If auto-detection doesn't work, create `cloudflare-pages.json` in project root:

```json
{
  "build": {
    "command": "npm run build",
    "cwd": "apps/web"
  }
}
```

---

## GitHub Actions CI/CD

### Setup

1. **Get Cloudflare API Token:**
   - Go to Cloudflare Dashboard → My Profile → API Tokens
   - Create token with "Edit Cloudflare Workers" permission
   - Copy token

2. **Get Account ID:**
   - Cloudflare Dashboard → Right sidebar → Account ID
   - Copy Account ID

3. **Add GitHub Secrets:**
   - Go to GitHub repo → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `CLOUDFLARE_API_TOKEN` - Your API token
     - `CLOUDFLARE_ACCOUNT_ID` - Your account ID
     - `VITE_SUPABASE_URL` - Supabase URL
     - `VITE_SUPABASE_ANON_KEY` - Supabase anon key
     - `GEMINI_API_KEY` - (Optional) Gemini API key

4. **Push to GitHub:**
   - The workflow (`.github/workflows/cloudflare-pages.yml`) will automatically deploy on push to `main`

### Manual Workflow Trigger

You can also trigger deployments manually:
- Go to GitHub repo → Actions → "Deploy to Cloudflare Pages" → Run workflow

---

## Deployment Scripts

### Production Deployment

```bash
cd apps/web
./deploy-cloudflare.sh
```

### Preview Deployment

```bash
cd apps/web
npm run build
wrangler pages deploy dist --project-name=dinein-malta --branch=preview
```

### Custom Domain

1. Go to Cloudflare Pages → Your Project → Custom domains
2. Add your domain
3. Update DNS records as instructed

---

## Build Optimization

### Current Build Settings

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

Check bundle size:
```bash
cd apps/web
npm run build
du -sh dist
```

---

## Routing Configuration

### SPA Routing

The `_redirects` file ensures all routes serve `index.html`:

```
/*    /index.html   200
```

This is automatically handled by Cloudflare Pages for SPAs.

### Custom Routes

If you need custom routing, create `functions/_middleware.ts`:

```typescript
export async function onRequest(context: EventContext) {
  const url = new URL(context.request.url);
  
  // Custom routing logic here
  
  return context.next();
}
```

---

## Service Worker

### Configuration

The service worker (`sw.js`) is automatically copied to `dist/` during build.

### Cache Strategy

- **Static assets**: Cache-first
- **API calls**: Network-first with cache fallback
- **HTML**: Network-first

### Updating Service Worker

Service worker updates automatically when you deploy. Users will get the new version on next visit.

---

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

Set up error tracking (Sentry recommended) for production monitoring.

---

## Troubleshooting

### Build Fails

**Error: Module not found**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: Type errors**
```bash
# Run type check separately
npm run typecheck
```

### Deployment Fails

**Error: Authentication failed**
```bash
wrangler login
```

**Error: Project not found**
```bash
# Create project first
wrangler pages project create dinein-malta
```

### Routes Return 404

- Verify `_redirects` file is in `public/` directory
- Check it's copied to `dist/` after build
- Ensure Cloudflare Pages SPA routing is enabled

### Environment Variables Not Working

- Variables must be set in Cloudflare Dashboard
- Use `VITE_` prefix for Vite variables
- Rebuild after changing variables

### Service Worker Not Updating

- Clear browser cache
- Check `sw.js` is in `dist/` directory
- Verify service worker registration in browser DevTools

---

## Performance Optimization

### Cloudflare Features

1. **Auto Minify**: Enabled by default
2. **Brotli Compression**: Automatic
3. **CDN**: Global edge network
4. **Caching**: Automatic static asset caching

### Additional Optimizations

1. **Image Optimization**: Use Cloudflare Images or optimize before upload
2. **Font Optimization**: Use `font-display: swap`
3. **Lazy Loading**: Already implemented for routes
4. **Code Splitting**: Already configured in Vite

---

## Security

### Headers

Cloudflare automatically adds security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### Custom Headers

Add to `_headers` file in `public/`:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## Rollback

### Via Dashboard

1. Go to Cloudflare Pages → Your Project → Deployments
2. Find previous deployment
3. Click "..." → "Retry deployment"

### Via CLI

```bash
wrangler pages deployment list --project-name=dinein-malta
wrangler pages deployment rollback <deployment-id> --project-name=dinein-malta
```

---

## Cost

Cloudflare Pages is **free** for:
- Unlimited requests
- Unlimited bandwidth
- Unlimited deployments
- 500 builds/month

For higher limits, upgrade to Pro ($20/month).

---

## Support

- **Cloudflare Docs**: https://developers.cloudflare.com/pages
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler
- **Community**: https://community.cloudflare.com

---

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

---

**Status**: ✅ Ready for production deployment




