// A "service worker" is a small helper script that runs in the background
// and lets the browser save copies of your app's files, so it can open
// even with no internet connection (just like a real installed app).

// IMPORTANT: every time you update your app and re-upload files to GitHub,
// change this version number (v1 -> v2 -> v3...). That's what tells phones
// "the old saved copy is outdated, go get the new files."
const CACHE_NAME = "daily-planner-cache-v2";
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
  self.skipWaiting(); // don't wait around, activate this new version right away
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

// When a new version activates, delete any old, outdated cache versions.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME) // find caches that aren't the current version
          .map((key) => caches.delete(key))    // delete them
      )
    )
  );
  self.clients.claim(); // take control of the page immediately
});

// When the app requests a file, serve the saved copy if we have one,
// otherwise fetch it from the internet as normal.
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
