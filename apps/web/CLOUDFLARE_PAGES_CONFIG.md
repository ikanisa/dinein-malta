# Cloudflare Pages Configuration Guide

## Recommended Settings for ikanisa/dinein-malta

### Framework Preset
**Select**: `Vite`

This will automatically configure:
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: 20.x

---

### Manual Configuration (If Framework Preset Doesn't Work)

Since this is a **monorepo** with the app in `apps/web/`, use these settings:

#### Build Settings

**Framework preset**: `Vite` (or `None` if Vite not available)

**Build command**:
```bash
cd apps/web && npm ci --legacy-peer-deps && npm run build
```

Or if using framework preset:
```bash
npm run build
```
*(But you'll need to set root directory)*

**Build output directory**:
```
apps/web/dist
```

Or if root directory is set to `apps/web`:
```
dist
```

**Root directory (Advanced)**:
```
apps/web
```

**Node version**: `20` (or latest 20.x)

---

### Environment Variables

Add these in the Cloudflare Pages dashboard:

**Production Environment:**
```
VITE_SUPABASE_URL = https://elhlcdiosomutugpneoc.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaGxjZGlvc29tdXR1Z3BuZW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDU3NTMsImV4cCI6MjA3NDQ4MTc1M30.d92ZJG5E_9r7bOlRLBXRI6gcB_7ERVbL-Elp7fk4avY
```

**Preview Environment:**
(Same as above, or use different values for testing)

---

## Step-by-Step Configuration

### Option 1: Using Vite Framework Preset (Recommended)

1. **Framework preset**: Select `Vite`
2. **Root directory**: Set to `apps/web`
3. **Build command**: Leave as default (`npm run build`) or use:
   ```bash
   npm ci --legacy-peer-deps && npm run build
   ```
4. **Build output directory**: `dist`
5. **Environment variables**: Add the two variables above

### Option 2: Manual Configuration (If Vite Preset Not Available)

1. **Framework preset**: Select `None`
2. **Root directory**: `apps/web`
3. **Build command**:
   ```bash
   npm ci --legacy-peer-deps && npm run build
   ```
4. **Build output directory**: `dist`
5. **Node version**: `20`
6. **Environment variables**: Add the two variables above

---

## Why These Settings?

### Root Directory: `apps/web`
- The app is in a monorepo structure
- All build commands need to run from `apps/web/`
- Package.json and node_modules are in `apps/web/`

### Build Command: `npm ci --legacy-peer-deps && npm run build`
- `npm ci` installs dependencies (faster, more reliable than `npm install`)
- `--legacy-peer-deps` is needed for some dependency conflicts
- `npm run build` runs the Vite build

### Build Output: `dist`
- Vite outputs to `dist/` by default
- Since root directory is `apps/web`, the output is `apps/web/dist`
- But Cloudflare will look for `dist` relative to root directory

---

## Verification

After deployment, verify:

1. ✅ Site loads at `dinein.pages.dev`
2. ✅ All routes work (no 404s)
3. ✅ Service worker registers
4. ✅ API calls work (check browser console)
5. ✅ Environment variables are loaded (check Network tab)

---

## Troubleshooting

### Build Fails: "Cannot find module"

**Solution**: Make sure root directory is set to `apps/web`

### Build Fails: "Command not found: npm"

**Solution**: Check Node version is set to 20

### Routes Return 404

**Solution**: Verify `_redirects` file is in `apps/web/public/` and copied to `dist/`

### Environment Variables Not Working

**Solution**: 
- Variables must start with `VITE_` for Vite
- Rebuild after adding variables
- Check variables are set for correct environment (Production/Preview)

---

## Quick Reference

```
Framework preset: Vite
Root directory: apps/web
Build command: npm ci --legacy-peer-deps && npm run build
Build output: dist
Node version: 20
Environment variables:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
```

---

**After configuration, your site will be available at:**
🌐 https://dinein.pages.dev




