const CACHE_NAME = 'wells-method-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Установка service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Кеширование статических ресурсов');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch((error) => {
        console.error('Service Worker: Ошибка кеширования', error);
      })
  );
  self.skipWaiting();
});

// Активация service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Удаление старого кеша', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Перехват запросов (Cache First стратегия для статики, Network First для API)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Статические ресурсы - Cache First
  if (request.method === 'GET' && (
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.json') ||
    url.pathname === '/'
  )) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((response) => {
            // Кешируем только успешные ответы
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          });
        })
        .catch(() => {
          // Если сеть недоступна и кеша нет, возвращаем базовую страницу
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        })
    );
  }
  // API запросы - Network First с fallback на кеш
  else if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Кешируем успешные API ответы
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Если сеть недоступна, пытаемся вернуть из кеша
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Если кеша нет, возвращаем пустой ответ
            return new Response(
              JSON.stringify({ results: [], count: 0, next: null, previous: null }),
              {
                headers: { 'Content-Type': 'application/json' },
              }
            );
          });
        })
    );
  }
  // Для остальных запросов - обычный fetch
  else {
    event.respondWith(fetch(request));
  }
});

