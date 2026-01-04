# Cloudflare Pages Deployment - Quick Start

## 🚀 One-Command Deployment

```bash
cd apps/web
npm run deploy:cloudflare
```

Or use the script directly:

```bash
cd apps/web
./deploy-cloudflare.sh
```

## 📋 Prerequisites

1. **Install Wrangler CLI:**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Set Environment Variables in Cloudflare Dashboard:**
   - Go to: https://dash.cloudflare.com → Pages → Your Project → Settings → Environment Variables
   - Add:
     - `VITE_SUPABASE_URL` = `https://elhlcdiosomutugpneoc.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🔄 Automatic CI/CD

The GitHub Actions workflow (`.github/workflows/cloudflare-pages.yml`) automatically deploys on every push to `main`.

**Setup:**
1. Add GitHub Secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. Push to `main` branch → Auto-deploys! 🎉

## 📚 Full Documentation

See `DEPLOY_CLOUDFLARE.md` for complete deployment guide.




