// ⚡ Đổi version mỗi khi cập nhật web
const CACHE_VERSION = 'v20250829-1';
const CACHE_NAME = `odaycogi-cache-${CACHE_VERSION}`;

const ASSETS = [
  'index.html',
  'manifest.json',
  'images/icon-192.png',
  'images/icon-512.png',
  'images/LG.png',
  'trasua.html',
  'dich-vu.html',
  'dang-ky.html'
];

// Cài đặt Service Worker & cache file tĩnh
self.addEventListener('install', event => {
  console.log(`📥 Installing SW ${CACHE_VERSION}`);
  self.skipWaiting(); // kích hoạt ngay
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Xóa cache cũ khi activate
self.addEventListener('activate', event => {
  console.log(`⚡ Activating SW ${CACHE_VERSION}`);
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log(`🗑 Xóa cache cũ: ${key}`);
            return caches.delete(key);
          })
    ))
  );
  self.clients.claim(); // áp dụng ngay cho tất cả tab
});

// Chiến lược fetch: Network first, fallback Cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
