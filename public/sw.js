// Service worker minimale di Amon.
// Serve a due cose: rendere il sito "installabile" come app e dare un
// fallback offline di base. NON mette in cache le pagine dell'agenda
// (devono essere sempre aggiornate dal server), ma cache-a la shell statica.

const CACHE = "amon-v1";
const SHELL = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // Solo richieste GET dello stesso sito.
  if (request.method !== "GET" || new URL(request.url).origin !== location.origin) {
    return;
  }
  // Network-first: prova la rete, se offline usa la cache.
  event.respondWith(
    fetch(request)
      .then((res) => {
        // Aggiorna la cache della shell statica.
        if (request.mode === "navigate") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(request).then((m) => m || caches.match("/"))),
  );
});
