# Deploy Frontend to Supabase Hosting

Since you're using Supabase for backend (functions + database), deploy the frontend as a static site.

## Option 1: Supabase Hosting (Recommended)

Supabase offers static site hosting for your frontend.

### Prerequisites

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Link to your project** (already done):
   ```bash
   supabase link --project-ref elhlcdiosomutugpneoc
   ```

### Build the Frontend

```bash
cd apps/web

# Install dependencies
npm install

# Build for production
npm run build
```

This creates a `dist/` folder with all static files.

### Deploy to Supabase Hosting

```bash
# From apps/web directory
supabase hosting deploy dist --project-ref elhlcdiosomutugpneoc
```

Or use the Supabase Dashboard:
1. Go to https://supabase.com/dashboard/project/elhlcdiosomutugpneoc
2. Navigate to **Hosting** section
3. Upload the `dist/` folder or connect your Git repository

---

## Option 2: Netlify (Alternative)

If Supabase hosting isn't available, Netlify works great with the `_redirects` file.

### Deploy to Netlify

```bash
cd apps/web

# Build
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

Or connect your GitHub repo to Netlify for automatic deployments.

---

## Option 3: Cloudflare Pages (Alternative)

You already have `wrangler.toml` configured.

### Deploy to Cloudflare Pages

```bash
cd apps/web

# Build
npm run build

# Install Wrangler CLI
npm install -g wrangler

# Deploy
wrangler pages deploy dist --project-name=dinein-malta
```

Or connect your GitHub repo in Cloudflare Dashboard.

---

## Option 4: Vercel (Alternative)

```bash
cd apps/web

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

---

## Environment Variables

Make sure these are set in your hosting platform:

- `VITE_SUPABASE_URL`: `https://elhlcdiosomutugpneoc.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaGxjZGlvc29tdXR1Z3BuZW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDU3NTMsImV4cCI6MjA3NDQ4MTc1M30.d92ZJG5E_9r7bOlRLBXRI6gcB_7ERVbL-Elp7fk4avY`

**Note:** These are already baked into the build via the Dockerfile, but for static hosting, you may need to set them as build-time environment variables.

---

## Quick Deploy Script

Create a simple deploy script:

```bash
#!/bin/bash
# deploy-frontend.sh

cd apps/web

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building for production..."
npm run build

echo "🚀 Deploying to Supabase..."
supabase hosting deploy dist --project-ref elhlcdiosomutugpneoc

echo "✅ Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy-frontend.sh
```

---

## Post-Deployment Checklist

- [ ] Verify site loads correctly
- [ ] Test all routes (client, vendor, admin)
- [ ] Verify service worker registers
- [ ] Test PWA installation
- [ ] Check API calls work (Supabase functions)
- [ ] Test authentication flows
- [ ] Verify order creation works
- [ ] Test on mobile devices

---

## Continuous Deployment

For automatic deployments, connect your GitHub repo to your hosting platform:

1. **Supabase**: Connect repo in Dashboard → Hosting
2. **Netlify**: Connect repo in Netlify Dashboard
3. **Cloudflare Pages**: Connect repo in Cloudflare Dashboard
4. **Vercel**: Connect repo in Vercel Dashboard

Each push to `main` will automatically build and deploy.

---

## Troubleshooting

### Build fails
- Check Node.js version (should be 20+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

### Environment variables not working
- For static sites, env vars must be set at build time
- Use your hosting platform's environment variable settings

### Service worker not updating
- Clear browser cache
- Check `sw.js` is in `public/` and copied to `dist/`

### Routes not working (404 errors)
- Ensure `_redirects` file is in `public/` (for Netlify)
- Configure SPA routing in your hosting platform

---

**Recommended**: Use Supabase Hosting for seamless integration with your Supabase backend.




