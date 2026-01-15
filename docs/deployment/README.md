# Deployment Documentation

Complete deployment guides for the DineIn Malta PWA platform.

## Documentation Structure

- **[Quick Start](./README.md#quick-start)** - Get started deploying immediately
- **[Cloudflare Pages](./cloudflare-pages.md)** - Production deployment on Cloudflare Pages
- **[Local Development](./local-development.md)** - Setup for local development
- **[Supabase Setup](./supabase-setup.md)** - Database and edge function deployment
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions

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

## Deployment Methods

### Cloudflare Pages (Recommended - Production)

Automatic CI/CD deployment via GitHub Actions. See [Cloudflare Pages Guide](./cloudflare-pages.md) for details.

**Features:**
- ✅ Automatic deployments on push to `main`
- ✅ Preview deployments for pull requests
- ✅ Global CDN
- ✅ Free tier available
- ✅ Built-in analytics

### Local Development

For local development and testing. See [Local Development Guide](./local-development.md).

### Other Deployment Options

- **Docker/Cloud Run**: See `apps/web/deploy-cloud-run.sh`
- **Android APK**: See main [DEPLOYMENT.md](../DEPLOYMENT.md#android-apk-build)

## Environment Variables

### Client-Side (Vite)

Set in Cloudflare Pages Dashboard or `.env.local`:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**Note:** `GEMINI_API_KEY` is **NOT** needed client-side - it's only used server-side in Supabase edge functions.

### Server-Side (Supabase Edge Functions)

Set in Supabase Dashboard → Project Settings → Edge Functions:

- `GEMINI_API_KEY` - For AI features (server-side only)

## Release Checklist

Before deploying to production:

- [ ] All tests pass (`npm run test:all`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] ESLint clean (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Bundle size within targets (< 200KB main bundle)
- [ ] Env vars verified in Cloudflare Dashboard
- [ ] No secrets in `VITE_*` env vars
- [ ] RLS policies verified (see [Supabase Setup](./supabase-setup.md))

## Support

- **Cloudflare Docs**: https://developers.cloudflare.com/pages
- **Supabase Docs**: https://supabase.com/docs
- **Troubleshooting**: See [Troubleshooting Guide](./troubleshooting.md)

---

**Last Updated**: 2025-01
