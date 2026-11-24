/* Offline-Speicher: laedt die App einmal und haelt sie bereit. Nur eigene Dateien, nichts von Dritten. */
const V = "pw-v2";
const CORE = ["./", "index.html", "pruefen.html", "info.html", "vergleich.html", "style.css", "manifest.json",
  "js/theme.js", "js/pwa.js", "js/countries.js", "js/start.js", "js/hist.js", "js/vergleich.js", "js/mrz.js", "js/forensics.js", "js/ocr.js", "js/app.js",
  "vendor/tesseract.min.js", "vendor/worker.min.js", "vendor/tesseract-core-simd-lstm.wasm.js", "vendor/tesseract-core-lstm.wasm.js",
  "vendor/lang/eng.traineddata.gz", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.open(V).then(async c => {
    const hit = await c.match(r, { ignoreSearch: true });
    const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
