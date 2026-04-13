
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Il fetch handler è obbligatorio affinché Chrome e altri browser considerino l'app installabile
  event.respondWith(
    fetch(event.request).catch(() => {
      // Risposta di fallback se offline e risorsa non in cache
      return new Response('Motoclub VVF Roma è attualmente offline.');
    })
  );
});
