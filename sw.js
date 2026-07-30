const CACHE_NAME = 'incubapro-v1';
const DYNAMIC_CACHE = 'incubapro-dynamic-v1';

// Assets para pré-cachear (opcional, como estamos usando CDN, o Network-First cuidará)
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json'
];

// Instalação: Cacheia os assets estáticos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting())
    );
});

// Ativação: Limpa caches antigos automaticamente
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME && name !== DYNAMIC_CACHE)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: Estratégia Network-First com fallback para cache
self.addEventListener('fetch', (event) => {
    // Ignora requisições não-GET (como POST para a API do Groq)
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Se a rede retornar sucesso, clona e salva no cache dinâmico
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Se a rede falhar (offline), busca no cache estático primeiro, depois no dinâmico
                return caches.match(event.request).then((response) => {
                    return response || caches.match(event.request);
                }).catch(() => {
                    // Fallback final para navegação offline (retorna o index.html cacheado)
                    if (event.request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                    return new Response('Offline', { status: 503, statusText: 'Offline' });
                });
            })
    );
});
