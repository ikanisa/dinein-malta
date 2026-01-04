# Cloudflare Pages Deployment - Complete Setup ✅

## What's Been Configured

### ✅ 1. Deployment Script
- **File**: `apps/web/deploy-cloudflare.sh`
- **Features**:
  - Automatic authentication check
  - Type checking before build
  - Build verification
  - Error handling
  - Deployment URL extraction
  - Post-deployment instructions

### ✅ 2. GitHub Actions CI/CD
- **File**: `.github/workflows/cloudflare-pages.yml`
- **Features**:
  - Automatic deployment on push to `main`
  - Type checking
  - Build optimization
  - Environment variable support
  - Deployment status reporting

### ✅ 3. Build Configuration
- **File**: `apps/web/cloudflare-pages.json`
- **File**: `apps/web/wrangler.toml` (updated)
- **File**: `apps/web/.cloudflare-build.sh`
- **Features**:
  - Optimized build settings
  - SPA routing support
  - Service worker support

### ✅ 4. Routing Configuration
- **File**: `apps/web/public/_redirects`
- **File**: `apps/web/_redirects`
- **Features**:
  - SPA routing (all routes → index.html)
  - Cloudflare Pages compatibility

### ✅ 5. Documentation
- **File**: `apps/web/DEPLOY_CLOUDFLARE.md` - Complete guide
- **File**: `apps/web/README_CLOUDFLARE.md` - Quick start

### ✅ 6. NPM Scripts
- Added `deploy:cloudflare` script to `package.json`
- Added `build:cloudflare` script for CI/CD

---

## Quick Deployment

### First Time Setup

1. **Install Wrangler:**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Create Cloudflare Pages Project:**
   ```bash
   wrangler pages project create dinein-malta
   ```

4. **Set Environment Variables** (in Cloudflare Dashboard):
   - Go to: https://dash.cloudflare.com → Pages → dinein-malta → Settings → Environment Variables
   - Add:
     ```
     VITE_SUPABASE_URL = https://elhlcdiosomutugpneoc.supabase.co
     VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

### Deploy

```bash
cd apps/web
npm run deploy:cloudflare
```

Or use the script directly:
```bash
cd apps/web
./deploy-cloudflare.sh
```

---

## GitHub Actions Setup (Optional but Recommended)

### 1. Get Cloudflare Credentials

**API Token:**
1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Create token with "Edit Cloudflare Workers" permission
3. Copy token

**Account ID:**
1. Go to: https://dash.cloudflare.com
2. Right sidebar → Copy Account ID

### 2. Add GitHub Secrets

Go to: GitHub repo → Settings → Secrets and variables → Actions

Add these secrets:
- `CLOUDFLARE_API_TOKEN` - Your API token
- `CLOUDFLARE_ACCOUNT_ID` - Your account ID
- `VITE_SUPABASE_URL` - `https://elhlcdiosomutugpneoc.supabase.co`
- `VITE_SUPABASE_ANON_KEY` - Your anon key
- `GEMINI_API_KEY` - (Optional) If needed

### 3. Push to GitHub

Every push to `main` will automatically:
1. Run type check
2. Build the application
3. Deploy to Cloudflare Pages
4. Report deployment status

---

## Build Process

### Local Build

```bash
cd apps/web
npm install
npm run build
```

Output: `dist/` directory with all static files

### Cloudflare Build

Cloudflare Pages automatically:
1. Detects Vite project
2. Runs `npm ci`
3. Runs `npm run build`
4. Deploys `dist/` directory

### Build Optimization

- ✅ Code splitting (React, Framer Motion, Supabase)
- ✅ Minification (esbuild)
- ✅ Tree shaking
- ✅ Asset optimization
- ✅ Service worker caching

---

## Project Structure

```
apps/web/
├── deploy-cloudflare.sh          # Deployment script
├── .cloudflare-build.sh          # Build script for CI/CD
├── cloudflare-pages.json         # Cloudflare Pages config
├── wrangler.toml                 # Wrangler config
├── _redirects                    # SPA routing rules
├── public/
│   └── _redirects                # SPA routing (copied to dist)
├── DEPLOY_CLOUDFLARE.md          # Complete deployment guide
└── README_CLOUDFLARE.md          # Quick start guide

.github/workflows/
└── cloudflare-pages.yml          # CI/CD workflow
```

---

## Environment Variables

### Required (Set in Cloudflare Dashboard)

```
VITE_SUPABASE_URL=https://elhlcdiosomutugpneoc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Optional

```
GEMINI_API_KEY=your_key_here  # Only if needed client-side
```

**Note:** These are build-time variables. They're baked into the build during `npm run build`.

---

## Features

### ✅ Automatic SPA Routing
- All routes serve `index.html`
- Client-side routing works perfectly
- No 404 errors on refresh

### ✅ Service Worker Support
- Offline functionality
- Background sync
- Cache management

### ✅ PWA Features
- Manifest.json
- Icons
- Install prompt
- Offline support

### ✅ Performance
- Global CDN
- Automatic compression
- Edge caching
- Fast TTFB

### ✅ Security
- Automatic HTTPS
- Security headers
- DDoS protection

---

## Monitoring

### Cloudflare Analytics

View in Dashboard:
- Page views
- Unique visitors
- Performance metrics
- Error rates
- Bandwidth usage

### Deployment History

```bash
wrangler pages deployment list --project-name=dinein-malta
```

### View Logs

```bash
wrangler pages deployment tail --project-name=dinein-malta
```

---

## Troubleshooting

### Build Fails

**Clear cache:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Check Node version:**
```bash
node --version  # Should be 20+
```

### Deployment Fails

**Check authentication:**
```bash
wrangler whoami
```

**Verify project exists:**
```bash
wrangler pages project list
```

### Routes Return 404

- Verify `_redirects` file exists in `public/`
- Check it's copied to `dist/` after build
- Ensure Cloudflare Pages SPA routing is enabled

---

## Next Steps

1. ✅ **Deploy to Cloudflare Pages**
   ```bash
   cd apps/web
   npm run deploy:cloudflare
   ```

2. ✅ **Set up GitHub Actions** (optional)
   - Add secrets
   - Push to main
   - Auto-deploy!

3. ✅ **Configure Custom Domain** (optional)
   - Cloudflare Dashboard → Pages → Custom domains
   - Add your domain
   - Update DNS

4. ✅ **Monitor Deployment**
   - Check Cloudflare Analytics
   - Monitor error rates
   - Test all features

---

## Support

- **Cloudflare Docs**: https://developers.cloudflare.com/pages
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler
- **Full Guide**: See `apps/web/DEPLOY_CLOUDFLARE.md`

---

**Status**: ✅ **Ready for deployment!**

Run `cd apps/web && npm run deploy:cloudflare` to deploy now.




