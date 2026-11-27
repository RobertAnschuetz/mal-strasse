// Offline-Cache: Alle Dateien werden beim ersten Öffnen gespeichert.
// Dateiliste und Version werden mit `node tools/update-sw.mjs` erzeugt.
const CACHE = 'malstrasse-202611272031';
const FILES = [
  './',
  'css/app.css',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon.svg',
  'index.html',
  'js/app.js',
  'js/challenges.js',
  'js/confetti.js',
  'js/curriculum.js',
  'js/differences.js',
  'js/difficulty.js',
  'js/dranbleib.js',
  'js/gallery-db.js',
  'js/garages.js',
  'js/masks.js',
  'js/maze.js',
  'js/memory.js',
  'js/motifs/catalog.js',
  'js/motifs/letters.js',
  'js/motifs/shapes.js',
  'js/paint.js',
  'js/penalty.js',
  'js/phrases.js',
  'js/pick.js',
  'js/playtime-ui.js',
  'js/playtime.js',
  'js/puzzle-images.js',
  'js/puzzle.js',
  'js/scoring.js',
  'js/screens/album.js',
  'js/screens/challenge-play.js',
  'js/screens/challenges-pick.js',
  'js/screens/diff-play.js',
  'js/screens/dranbleib-pick.js',
  'js/screens/dranbleib-session.js',
  'js/screens/gallery.js',
  'js/screens/garage-play.js',
  'js/screens/maze-play.js',
  'js/screens/memory-play.js',
  'js/screens/pick.js',
  'js/screens/puzzle-play.js',
  'js/screens/puzzles.js',
  'js/screens/reward.js',
  'js/screens/road.js',
  'js/screens/setup.js',
  'js/screens/start.js',
  'js/screens/task.js',
  'js/screens/world-play.js',
  'js/screens/worlds-pick.js',
  'js/sound.js',
  'js/speech.js',
  'js/stickers.js',
  'js/storage.js',
  'js/testmode.js',
  'js/world-images.js',
  'js/worlds.js',
  'manifest.webmanifest',
];

self.addEventListener('install', (e) => {
  // cache: 'reload' umgeht den HTTP-Cache, damit nie alte Dateien unter der neuen Version landen
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request)),
  );
});
