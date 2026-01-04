# Cloudflare Pages Build Fix

## Problem
Build fails with: "npm ci can only install with an existing package-lock.json"

## Solution

### Option 1: Use `npm install` instead (Recommended)

**Build command**:
```bash
npm install --legacy-peer-deps && npm run build
```

This works even if package-lock.json has issues.

### Option 2: Ensure package-lock.json is committed

Make sure `apps/web/package-lock.json` is committed to git and pushed.

---

## Updated Cloudflare Pages Configuration

### Build Settings

**Framework preset**: `Vite` (or `None`)

**Root directory**: `apps/web`

**Build command**:
```bash
npm install --legacy-peer-deps && npm run build
```

**Build output directory**: `dist`

**Node version**: `20`

---

## Why This Works

- `npm install` is more forgiving than `npm ci`
- `--legacy-peer-deps` handles dependency conflicts
- Works even if package-lock.json has minor issues
- Still creates a clean install

---

## Alternative: Use npm ci with explicit path

If you prefer `npm ci`, try:
```bash
cd apps/web && npm ci --legacy-peer-deps && npm run build
```

But since root directory is already `apps/web`, the first option is cleaner.




