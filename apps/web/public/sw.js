// Service Worker for DineIn PWA
// Cache-first strategy for static assets, network-first for API calls

const CACHE_NAME = 'dinein-v1';
const STATIC_CACHE = 'dinein-static-v1';
const API_CACHE = 'dinein-api-v1';

// Assets to precache
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Precaching static assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== API_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  event.waitUntil(self.clients.claim());
});

// Fetch event - cache strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Static assets: Cache-first strategy
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // API calls: Network-first with cache fallback
  if (url.pathname.includes('/functions/') || url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request).then((cached) => {
            if (cached) {
              return cached;
            }
            // Return offline response if no cache
            return new Response(
              JSON.stringify({ error: 'Offline', offline: true }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          });
        })
    );
    return;
  }

  // HTML pages: Network-first
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match(request);
        })
    );
    return;
  }

  // Default: Network-first
  event.respondWith(fetch(request));
});

// Background sync for offline orders
self.addEventListener('sync', (event) => {
  if (event.tag.startsWith('sync-order-')) {
    event.waitUntil(syncOrder(event.tag));
  }
});

async function syncOrder(tag) {
  try {
    const queuedOrders = JSON.parse(localStorage.getItem('queued_orders') || '[]');
    const orderId = tag.replace('sync-order-', '');
    const queuedOrder = queuedOrders.find((o) => o.id === orderId);

    if (!queuedOrder) {
      return;
    }

    // Try to create order
    const response = await fetch('/functions/order_create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify(queuedOrder.orderData),
    });

    if (response.ok) {
      // Remove from queue
      const updated = queuedOrders.filter((o) => o.id !== orderId);
      localStorage.setItem('queued_orders', JSON.stringify(updated));
      
      // Notify client
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({
          type: 'ORDER_SYNCED',
          orderId: queuedOrder.orderData.vendor_id,
        });
      });
    }
  } catch (error) {
    console.error('[SW] Sync error:', error);
  }
}

async function getAuthToken() {
  // Get auth token from IndexedDB or return null
  // This is a simplified version - in production, you'd need to store the token
  return null;
}

// Message handler for manual sync
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SYNC_QUEUE') {
    event.waitUntil(syncAllOrders());
  }
});

async function syncAllOrders() {
  const queuedOrders = JSON.parse(localStorage.getItem('queued_orders') || '[]');
  for (const order of queuedOrders) {
    await syncOrder(`sync-order-${order.id}`);
  }
}
