const CACHE_PREFIX = 'servicehub-pwa-';
const CACHE_NAME = `${CACHE_PREFIX}__SERVICEHUB_BUILD__`;
const OFFLINE_URL = '/offline.html';
const PUBLIC_FILES = [
  OFFLINE_URL,
  '/pwa/icon-192.png',
  '/pwa/icon-512.png',
  '/pwa/maskable-512.png',
  '/pwa/apple-touch-icon.png',
];
const publicPaths = new Set(PUBLIC_FILES);

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(
    PUBLIC_FILES.map(path => new Request(path, { credentials: 'omit', cache: 'reload' })),
  )));
  // A replacement waits for the user's Update now action. Never interrupt a form.
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') event.waitUntil(self.skipWaiting());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  // APIs, RSC responses, mutations, maps, sockets and third-party requests bypass
  // Cache Storage entirely. Authenticated HTML is always fetched from the network.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => {
      const cache = await caches.open(CACHE_NAME);
      return await cache.match(OFFLINE_URL) || new Response('You are offline. Reconnect and reload ServiceHub.', {
        status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }));
  } else if (publicPaths.has(url.pathname) && !url.search) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      return await cache.match(request) || fetch(request);
    })());
  }
});
