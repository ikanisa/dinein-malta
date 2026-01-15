# DineIn Malta - Deployment Guide

Complete guide for deploying the DineIn Malta PWA to production and managing the deployment lifecycle.

> **📚 For detailed guides, see the [deployment documentation directory](./deployment/README.md)**

## Quick Links

- **[Quick Start & Overview](./deployment/README.md)** - Get started immediately
- **[Cloudflare Pages](./deployment/cloudflare-pages.md)** - Production deployment
- **[Local Development](./deployment/local-development.md)** - Local setup
- **[Supabase Setup](./deployment/supabase-setup.md)** - Database & backend
- **[Troubleshooting](./deployment/troubleshooting.md)** - Common issues

## Table of Contents

1. [Quick Start](#quick-start)
2. [Deployment Methods](#deployment-methods)
3. [Release Checklist](#release-checklist)
4. [Android APK Build](#android-apk-build)

---

## Quick Start

### Prerequisites

- Node.js 20+
- Git
- Cloudflare account (for production deployment)
- Supabase account (for backend)

### One-Command Deployment

```bash
cd apps/web
npm run deploy:cloudflare
```

Or use the deployment script:

```bash
cd apps/web
./deploy-cloudflare.sh
```

---

## Deployment Methods

### Cloudflare Pages (Recommended)

Production deployment with automatic CI/CD. See **[Cloudflare Pages Guide](./deployment/cloudflare-pages.md)** for complete instructions.

### Local Development

For local development and testing. See **[Local Development Guide](./deployment/local-development.md)**.

### Supabase Backend

Database, edge functions, and RLS setup. See **[Supabase Setup Guide](./deployment/supabase-setup.md)**.

### Troubleshooting

Having issues? See **[Troubleshooting Guide](./deployment/troubleshooting.md)**.

---

## Detailed Guides

For complete deployment documentation, see the [deployment documentation directory](./deployment/README.md):

- **[Cloudflare Pages Deployment](./deployment/cloudflare-pages.md)** - Complete production deployment guide

### Initial Setup

1. **Install Wrangler CLI:**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Get Your Account ID:**
   ```bash
   wrangler whoami
   ```
   Or find it in Cloudflare Dashboard → Right sidebar → Account ID

### Environment Variables

Set these in Cloudflare Pages Dashboard → Settings → Environment Variables:

**Required Variables:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**Note:** GEMINI_API_KEY is only used server-side in Supabase edge functions, not in client builds.

### Build Configuration

**Recommended Settings:**

- **Framework preset**: `Vite`
- **Root directory**: `apps/web`
- **Build command**: `npm ci --legacy-peer-deps && npm run build`
- **Build output directory**: `dist`
- **Node version**: `20`

**Alternative Build Command** (if `npm ci` fails):
```bash
npm install --legacy-peer-deps && npm run build
```

### Automatic CI/CD

The GitHub Actions workflow (`.github/workflows/cloudflare-pages.yml`) automatically deploys on every push to `main`.

**Setup GitHub Secrets:**
1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
   - `VITE_SUPABASE_URL` - Supabase URL
   - `VITE_SUPABASE_ANON_KEY` - Supabase anon key

**Manual Workflow Trigger:**
- Go to GitHub repo → Actions → "Deploy to Cloudflare Pages" → Run workflow

### Manual Deployment

```bash
cd apps/web

# Install dependencies
npm ci --legacy-peer-deps

# Build
npm run build

# Deploy
wrangler pages deploy dist --project-name=dinein-malta
```

### Preview Deployments

All pull requests get automatic preview URLs in Cloudflare Pages. Preview branches use preview environment variables.

### SPA Routing

The `_redirects` file in `apps/web/public/` handles SPA routing:

```
/*    /index.html   200
```

This is automatically handled by Cloudflare Pages for SPAs.

### Custom Domain

1. Go to Cloudflare Pages → Your Project → Custom domains
2. Add your domain
3. Update DNS records as instructed

### Performance Optimization

The `vite.config.ts` is optimized for Cloudflare Pages:

- ✅ Code splitting (React, Framer Motion, Supabase)
- ✅ Minification (esbuild)
- ✅ Tree shaking
- ✅ Asset optimization
- ✅ Service worker caching

**Bundle Size Targets:**
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

## Android APK Build

### Prerequisites

- Android Studio
- Java JDK 17+
- Capacitor CLI

### Debug Build

```bash
cd apps/web
npm run android:build:debug
```

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release Build (requires signing)

1. Configure signing in `android/app/build.gradle`
2. Set environment variables for keystore credentials
3. Run:

```bash
cd apps/web
npm run android:build
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

### Open in Android Studio

```bash
cd apps/web
npm run cap:open:android
```

### Sync Web Assets

After making changes to the web app:

```bash
cd apps/web
npm run build
npm run cap:sync
```

### Firebase App Distribution

Using Firebase CLI:

```bash
firebase appdistribution:distribute android/app/build/outputs/apk/release/app-release.apk \
  --app YOUR_FIREBASE_APP_ID \
  --groups "internal-testers" \
  --release-notes "New build"
```

---

## Release Checklist

### Pre-Deploy

- [ ] All tests pass (`npm run test:all`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] ESLint clean (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Bundle size within targets (< 200KB main bundle)
- [ ] Env vars verified in Cloudflare Dashboard (Production + Preview)
- [ ] No secrets in `VITE_*` env vars
- [ ] RLS policies verified (see [Supabase Setup](./deployment/supabase-setup.md))

### Deploy

- [ ] Push to `main` branch (auto-deploys to Production)
- [ ] Monitor Cloudflare Dashboard for build status
- [ ] Build completes without errors

### Post-Deploy Verification

- [ ] Site loads at production URL
- [ ] Hard refresh (`Cmd+Shift+R`) loads new bundle
- [ ] Deep links work (e.g., `/vendor/dashboard` returns 200, not 404)
- [ ] Service worker updates (check DevTools → Application → Service Workers)
- [ ] API calls work (check browser console for errors)
- [ ] Security headers present (check DevTools → Network → Response Headers)
- [ ] PWA loads correctly
- [ ] Venues load from Supabase
- [ ] Service worker registers for offline support
- [ ] Icons and manifest are properly served

For detailed troubleshooting, see [Troubleshooting Guide](./deployment/troubleshooting.md).

---
