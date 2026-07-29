var CACHE = 'incubapro-v2';

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll([
        './',
        './index.html',
        './style.css',
        './app.js',
        './manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  e.waitUntil(clients.claim());
});

self.addEventListener("fetch", function(e) {
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request).then(function(res) {
        if (res.status === 200 && res.type === 'basic') {
          var cl = res.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, cl); });
        }
        return res;
      });
    }).catch(function() {
      return new Response('Offline', { status: 503 });
    })
  );
});
