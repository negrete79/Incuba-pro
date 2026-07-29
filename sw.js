const CACHE_NAME = 'incubapro-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js',
  'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&display=swap'
];

// Instalação e cache de arquivos estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// Interceptação de requisições (Estratégia: Cache First, depois Network)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then(response => {
          // Não cacheia requisições que não são GET ou originárias de APIs externas diferentes das permitidas
          if (!response || response.status !== 200 || response.type !== 'basic') return response;
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
          return response;
        }).catch(() => {
          // Fallback offline para a página principal
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
