/* Untint service worker: keeps the game playable offline.
   App files: network first (so updates arrive), cache when offline or the network takes over 3 s.
   Google Fonts: cache first, filled the first time they load.
   Bump VERSION on every release so old caches are cleared. */
const VERSION = 'untint-1.0.0';
const SHELL = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png'
];
const FONTS = 'untint-fonts';

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== FONTS).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function networkFirst(request){
  return caches.open(VERSION).then(cache => {
    const fromNetwork = fetch(request).then(res => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    });
    fromNetwork.catch(() => {});
    const timeout = new Promise(resolve => setTimeout(resolve, 3000));
    const cached = () => cache.match(request, { ignoreSearch: true })
      .then(hit => hit || (request.mode === 'navigate' ? cache.match('index.html') : undefined));
    return Promise.race([fromNetwork, timeout.then(cached)])
      .then(res => res || fromNetwork)
      .catch(() => cached().then(hit => hit || Response.error()));
  });
}

function cacheFirst(request){
  return caches.open(FONTS).then(cache => cache.match(request).then(hit => hit || fetch(request).then(res => {
    if (res.ok || res.type === 'opaque') cache.put(request, res.clone());
    return res;
  })));
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) event.respondWith(networkFirst(request));
  else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') event.respondWith(cacheFirst(request));
});
