// K-Bridge Service Worker v1.0
const CACHE = 'kbridge-v1';
const PRECACHE = ['/', '/manifest.json', '/icons/icon-192x192.png', '/icons/icon-512x512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // 백엔드 API(8000포트) → 네트워크 전용
  if (url.port === '8000' || url.pathname.startsWith('/chat')) {
    e.respondWith(fetch(e.request).catch(() =>
      new Response(JSON.stringify({ error: '오프라인 상태입니다.' }), {
        headers: { 'Content-Type': 'application/json' }
      })
    ));
    return;
  }

  // 정적 자산 → 캐시 우선
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});

// Push 알림
self.addEventListener('push', e => {
  const d = e.data?.json() ?? {};
  e.waitUntil(
    self.registration.showNotification(d.title ?? 'K-Bridge', {
      body: d.body ?? '새 알림이 있습니다.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
    })
  );
});
