// Minimal service worker (cache-first for shell). Customize as needed.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (event) => {
  // Keep it minimal; Next.js assets are already cacheable via headers on Cloud Run/CDN.
});
