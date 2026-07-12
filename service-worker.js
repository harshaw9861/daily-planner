// A "service worker" is a small helper script that runs in the background
// and lets the browser save copies of your app's files, so it can open
// even with no internet connection (just like a real installed app).

const CACHE_NAME = "daily-planner-cache-v1";
const FILES_TO_CACHE = [
  "index.html",
  "style.css",
  "script.js",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
];

// When the service worker is installed, save all our app files.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

// When the app requests a file, serve the saved copy if we have one,
// otherwise fetch it from the internet as normal.
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
