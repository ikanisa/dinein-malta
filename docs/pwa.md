# PWA Configuration

This document describes the Progressive Web App setup for DineIn applications.

---

## Overview

All three DineIn apps are Progressive Web Apps:

| App | Standalone | Offline | Install Prompt |
|-----|------------|---------|----------------|
| Customer | ✅ | ✅ (orders) | After engagement |
| Venue | ✅ | Partial | On login |
| Admin | ✅ | ❌ | Never |

---

## Manifest Configuration

Each app has a `public/manifest.json`:

```json
{
  "name": "DineIn Customer",
  "short_name": "DineIn",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#18181b",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### App-Specific Colors

| App | Theme Color | Background |
|-----|-------------|------------|
| Customer | `#18181b` | `#000000` |
| Venue | `#1e3a5f` | `#0f172a` |
| Admin | `#7c3aed` | `#0f0f0f` |

---

## Service Worker

Using [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) with `injectManifest` strategy.

### Configuration (vite.config.ts)

```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: 'auto',
      manifest: false, // Using public/manifest.json
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      },
      devOptions: {
        enabled: true
      }
    })
  ]
})
```

### Custom Service Worker (src/sw.ts)

```typescript
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { BackgroundSyncPlugin } from 'workbox-background-sync'

// Precache app shell
precacheAndRoute(self.__WB_MANIFEST)

// API calls: Network first, fall back to cache
registerRoute(
  ({ url }) => url.pathname.startsWith('/rest/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10
  })
)

// Static assets: Cache first
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache'
  })
)

// Background sync for offline orders (Customer app only)
const bgSyncPlugin = new BackgroundSyncPlugin('orderQueue', {
  maxRetentionTime: 24 * 60 // 24 hours
})
```

---

## Caching Strategy

| Resource Type | Strategy | Cache Name | TTL |
|--------------|----------|------------|-----|
| App shell (HTML/JS/CSS) | Precache | `workbox-precache` | Until update |
| API calls | NetworkFirst | `api-cache` | 10s timeout |
| Images | CacheFirst | `image-cache` | 30 days |
| Fonts | CacheFirst | `font-cache` | 1 year |

---

## Update Strategy

### How Updates Work

1. New version deployed to Cloudflare Pages
2. Service worker detects new precache manifest
3. New SW installs in background
4. `skipWaiting()` activates immediately
5. User sees update badge (optional)
6. Next page load uses new version

### Configuration

```typescript
// In sw.ts
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})
```

### Update Badge (useA2HS hook)

```typescript
// Customer app shows update prompt
const { updateAvailable, updateApp } = useA2HS()

if (updateAvailable) {
  return <UpdateBanner onClick={updateApp} />
}
```

---

## Offline Support

### Customer App

| Feature | Offline Behavior |
|---------|-----------------|
| View menu | ✅ Cached if visited |
| Add to cart | ✅ Local storage |
| Place order | ⏳ Queued for sync |
| View order status | ❌ Requires network |

### Venue Portal

| Feature | Offline Behavior |
|---------|-----------------|
| View orders | ⏳ Shows cached |
| Update status | ❌ Requires network |
| Edit menu | ❌ Requires network |

### Admin Portal

| Feature | Offline Behavior |
|---------|-----------------|
| All features | ❌ Requires network |

---

## Install Prompt

### When to Show

Per DineIn rules, install prompts appear **after meaningful engagement**:

- **Customer**: After placing an order OR adding 2+ items OR 45s browsing
- **Venue**: After successful login
- **Admin**: Never (desktop-focused)

### Implementation

```typescript
// useA2HS.ts hook
export function useA2HS() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setCanInstall(false)
    return outcome
  }

  return { canInstall, promptInstall }
}
```

### UI Component

```tsx
// Only shown after engagement criteria met
{canInstall && hasEngaged && (
  <Button onClick={promptInstall}>
    Add to Home Screen
  </Button>
)}
```

---

## Testing PWA Features

### Lighthouse Audit

```bash
# Run Lighthouse PWA audit
npx lighthouse http://localhost:5173 --only-categories=pwa
```

### Manual Checklist

- [ ] Manifest loads correctly
- [ ] Service worker registers
- [ ] App works offline (cached pages)
- [ ] Install prompt appears after engagement
- [ ] Update flow works (deploy, refresh)
- [ ] Icons display correctly on home screen

### DevTools Testing

1. **Application tab** → Service Workers
2. Check "Update on reload" for development
3. Use "Offline" checkbox to test offline behavior
4. Application tab → Manifest to verify icons

---

## Troubleshooting

### Stale Content After Deploy

**Symptom**: Old JS/CSS still showing after deploy

**Fix**:
1. Hard refresh: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)
2. Clear site data: DevTools → Application → Clear storage
3. Verify `skipWaiting()` is enabled in SW

### Install Prompt Not Showing

**Symptom**: "Add to Home Screen" never appears

**Causes**:
- Already installed
- Not served over HTTPS
- Manifest missing required fields
- User dismissed previously

**Fix**: Check manifest at DevTools → Application → Manifest

### Offline Not Working

**Symptom**: App shows error when offline

**Fix**:
1. Verify precache manifest generated
2. Check SW registered: `navigator.serviceWorker.controller`
3. Verify caching strategies match routes
