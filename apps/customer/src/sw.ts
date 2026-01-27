import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

declare let self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()

cleanupOutdatedCaches()

precacheAndRoute(self.__WB_MANIFEST)

// 1. Assets (JS, CSS, Images, Workers) - StaleWhileRevalidate
registerRoute(
    ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
    new StaleWhileRevalidate({
        cacheName: 'assets-cache',
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
        ]
    })
)

// 2. Images - CacheFirst (with expiration)
registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: 'images-cache',
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 }), // 30 Days
        ]
    })
)

// 3. API Requests (Supabase) - NetworkFirst (GET ONLY)
// Safe for Menus/Venues. Writes (Orders) go to network only.
registerRoute(
    ({ url, request }) =>
        url.hostname.includes('supabase.co') &&
        request.method === 'GET',
    new NetworkFirst({
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10, // Fallback to cache after 10s timeout
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 }), // 24 Hours
        ]
    })
)
