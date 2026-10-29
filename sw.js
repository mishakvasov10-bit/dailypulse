const C = 'dailypulse-v2';

const F = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(C)
      .then(c => c.addAll(F))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(k => k !== C).map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(C).then(cache => cache.put(e.request, copy));
        }
        return response;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
