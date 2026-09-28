// Hand-written service worker — Next.js 16 defaults to Turbopack, which
// doesn't run webpack plugins (Workbox-based PWA tooling included), so this
// is written directly rather than generated. See ServiceWorkerRegister.tsx
// for where it's registered (production only).
const CACHE_VERSION = "v1";
const APP_SHELL_CACHE = `taskfolio-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `taskfolio-runtime-${CACHE_VERSION}`;

const APP_SHELL = ["/", "/manifest.json", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== APP_SHELL_CACHE && key !== RUNTIME_CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

function isMuseumArt(url) {
  return url.pathname.startsWith("/art/");
}

// next/font self-hosts Google Fonts at build time (served from this app's
// own origin under /_next/static/media/), so there's no cross-origin Google
// Fonts request to intercept — this is the real equivalent for this app.
function isFontAsset(url) {
  return url.pathname.startsWith("/_next/static/media/") && /\.(woff2?|ttf)$/.test(url.pathname);
}

// Serve from cache immediately if present, refresh the cache from the
// network in the background either way.
function staleWhileRevalidate(request) {
  return caches.open(RUNTIME_CACHE).then((cache) =>
    cache.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isMuseumArt(url) || isFontAsset(url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/").then((cached) => cached || caches.match(request))));
  }
});
