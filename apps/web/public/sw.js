// Service Worker for DineIn PWA
// Cache-first strategy for static assets, network-first for API calls

const CACHE_VERSION = 'v3'; // Increment for new caching strategy
const CACHE_NAME = `dinein-${CACHE_VERSION}`;
const STATIC_CACHE = `dinein-static-${CACHE_VERSION}`;
const API_CACHE = `dinein-api-${CACHE_VERSION}`;
const MENU_CACHE = `dinein-menu-${CACHE_VERSION}`;

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
          .filter((name) => 
            name !== STATIC_CACHE && 
            name !== API_CACHE && 
            name !== MENU_CACHE &&
            name.startsWith('dinein-') // Only delete old dinein caches
          )
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
      .then(() => notifyClients({ type: 'SW_UPDATED', version: CACHE_VERSION }))
  );
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

  // Menu data: Cache-first (1 hour) - allows offline menu viewing
  if (
    url.pathname.includes('/rest/v1/vendors') ||
    url.pathname.includes('/rest/v1/menu_items') ||
    (url.pathname.includes('/rest/v1/') && url.searchParams.has('vendor_id'))
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        // Return cached menu data immediately if available
        if (cached) {
          // Also fetch in background to update cache
          fetch(request)
            .then((response) => {
              if (response.status === 200) {
                const responseToCache = response.clone();
                caches.open(MENU_CACHE).then((cache) => {
                  cache.put(request, responseToCache);
                });
              }
            })
            .catch(() => {
              // Silently fail background update if offline
            });
          return cached;
        }
        
        // If not cached, fetch from network
        return fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(API_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          })
          .catch(() => {
            // Return offline response if no cache and network fails
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

  // Orders: Network-first (always fetch fresh)
  if (
    url.pathname.includes('/rest/v1/orders') ||
    url.pathname.includes('/functions/order')
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache GET requests for orders (read-only)
          if (response.status === 200 && request.method === 'GET') {
            const responseToCache = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache only if network fails
          return caches.match(request).then((cached) => {
            if (cached) {
              return cached;
            }
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

  // Other API calls: Network-first with cache fallback
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

// Background sync: notify clients to process queued work with auth
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-queue') {
    event.waitUntil(notifyClients({ type: 'SYNC_QUEUE' }));
  }

  if (event.tag.startsWith('sync-order-')) {
    event.waitUntil(
      notifyClients({
        type: 'SYNC_ORDER',
        orderId: event.tag.replace('sync-order-', ''),
      })
    );
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'DineIn Malta', body: event.data.text() };
    }
  }

  const options = {
    title: data.title || 'DineIn Malta',
    body: data.body || 'You have a new update',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag || 'notification',
    data: data.data || {},
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(options.title, options).then(() => {
      // Notify clients about the push notification
      return notifyClients({ type: 'PUSH_NOTIFICATION', data });
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const urlToOpen = data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus existing window
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

async function notifyClients(message) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  clients.forEach((client) => client.postMessage(message));
}
