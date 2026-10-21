const CACHE_NAME = 'tuwoto-v14'; // Naikkan versi cache
const urlsToCache = [
  './',
  './index.html',
  './icon.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Paksa service worker baru langsung aktif
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  // Hapus cache versi lama agar tidak menumpuk
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  // Strategi Network First: Ambil dari internet dulu, jika gagal baru pakai cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Jangan simpan file .json ke cache agar tidak memenuhi memori HP
        if (event.request.url.includes('.json')) {
          return response;
        }
        
        // Simpan salinan terbaru ke cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Jika internet mati/gagal, ambil dari cache
        return caches.match(event.request);
      })
  );
});