// 簡單的離線快取：只快取「網站本身的檔案」（HTML/manifest/圖示），
// 讓使用者出國沒網路時，至少能打開 App、看到上次讀取過的資料
// （地點/路線資料本身是用 localStorage 存的，見 index.html 裡的
// saveOfflineSnapshot() / loadOfflineSnapshot()，不是靠 Service Worker 快取 Firestore）。
const CACHE_NAME = 'johnny-journey-shell-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // 網站本身的檔案（同源）：先試快取，快取沒有才去網路抓，抓到就順手更新快取
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const networkFetch = fetch(req).then((res) => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    );
  }
  // 外部資源（Firebase / CDN / 天氣 API 等）一律直接走網路，離線時本來就抓不到，
  // 交給 index.html 裡的離線提示 / localStorage 備援資料處理，不在這裡快取以免弄髒快取空間。
});
