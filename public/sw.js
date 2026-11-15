// Bu panel canlı veritabanı verisiyle çalışıyor, bu yüzden hiçbir şeyi
// önbelleğe almıyoruz — sadece "yüklenebilir" (installable) PWA olması için
// bir service worker kaydı gerekiyor. Her istek doğrudan ağa gidiyor.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
