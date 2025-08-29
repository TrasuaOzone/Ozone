// ⚡ Thay đổi version này mỗi lần bạn cập nhật website
const CACHE_VERSION = 'v20250829-1';
const CACHE_NAME = `odaycogi-cache-${CACHE_VERSION}`;

// Danh sách các file cần cache trước (precache)
const ASSETS = [
  '/', // trang gốc
  '/index.html',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/LG.png',
  '/trasua.html',
  '/dich-vu.html',
  '/dang-ky.html',
  '/bando.html',
  '/cham-soc-khach-hang.html',
  '/tra-cuu.html'
  // nếu có CSS/JS riêng thì thêm vào đây
];

// 📥 Cài đặt SW & cache file tĩnh
self.addEventListener('install', event => {
  console.log(`📥 Installing SW ${CACHE_VERSION}`);
  self.skipWaiting(); // kích hoạt ngay
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// ⚡ Kích hoạt: xóa cache cũ
self.addEventListener('activate', event => {
  console.log(`⚡ Activating SW ${CACHE_VERSION}`);
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => {
              console.log(`🗑 Xóa cache cũ: ${key}`);
              return caches.delete(key);
            })
      )
    )
  );
  self.clients.claim(); // áp dụng ngay
});

// 🌐 Chiến lược: Network First, fallback Cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return; // chỉ cache GET
  event.respondWith(
    fetch(event.request)
      .then(res => {
        // Cập nhật cache với dữ liệu mới
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request)) // nếu offline thì lấy cache
  );
});
