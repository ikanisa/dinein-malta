# Deployment Guide

Complete guide for deploying the DineIn Malta PWA to Cloudflare Pages and building Android APKs.

## Prerequisites

- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`) - optional for advanced Cloudflare management
- Android Studio (for Android builds)
- Java JDK 17+ (for Android builds)
- Access to the Cloudflare Pages project

## Environment Variables

Create a `.env` file in `apps/web/` with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Set environment variables in Cloudflare Pages Dashboard → Settings → Environment Variables.

## Cloudflare Pages

### Automatic Deployment

Push to `main` branch triggers automatic deployment via GitHub integration.

### Build Settings (Cloudflare Dashboard)

- **Framework preset**: Vite
- **Build command**: `cd apps/web && npm install && npm run build`
- **Build output directory**: `apps/web/dist`
- **Root directory**: (leave empty)

### SPA Routing

The `_redirects` file in `apps/web/public/` handles SPA routing:

```
/* /index.html 200
```

### Manual Deployment (via Wrangler)

```bash
cd apps/web
npm run build
npx wrangler pages deploy dist --project-name=dinein-malta
```

### Preview Deployments

All pull requests get automatic preview URLs in Cloudflare Pages.

## Android APK Build

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

## Firebase App Distribution

### Distribute APK

Using Firebase CLI:
```bash
firebase appdistribution:distribute android/app/build/outputs/apk/release/app-release.apk \
  --app YOUR_FIREBASE_APP_ID \
  --groups "internal-testers" \
  --release-notes "New build"
```

## Supabase Backend

### Database Migrations

Migrations are located in `supabase/migrations/`. Apply them using:

```bash
supabase db push
```

### Edge Functions

Deploy edge functions with:

```bash
supabase functions deploy
```

## Verification Checklist

After deployment, verify:

1. **PWA loads correctly** at the Cloudflare Pages URL
2. **Venues load** from Supabase
3. **Service worker** registers for offline support
4. **Icons and manifest** are properly served
5. **Android APK** installs and runs correctly

## Troubleshooting

### Build Errors

If you encounter module errors during build:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Capacitor Sync Issues

```bash
npx cap doctor
npx cap sync --inline
```

### Wrangler CLI Not Found

```bash
npm install -g wrangler
wrangler login
```
