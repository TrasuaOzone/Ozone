self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("odaycogi-cache-v1").then(cache => {
      return cache.addAll([
        "index.html",
        "manifest.json",
        "images/icon-192.png",
        "images/icon-512.png",
        "images/LG.png",
        "trasua.html",
        "dich-vu.html",
        "dang-ky.html"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
