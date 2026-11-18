// Push notifications, and (J4) starting without a network.
// The app's own files and the last full answer from each API are kept on the phone. Online, every
// request still goes to the network first, so a new deploy is picked up straight away; only when
// the network fails or takes longer than a few seconds does the saved copy answer instead.
const CACHE = "forsinkelseslogg-v1";
const SHELL = ["/", "/logg.html", "/betting.html", "/statistikk.html", "/theme.css", "/tema.js", "/gips.js", "/vakter.js", "/poll.js", "/reg.js", "/swipe.js", "/fx.js", "/fun.js", "/runde2.js", "/mirakel.js", "/maaned.js", "/nyttaar.js", "/bord.js", "/vinner.js", "/manifest.webmanifest", "/icon-192.png", "/apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.allSettled(SHELL.map((u) => c.add(new Request(u, { cache: "reload" }))))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("forsinkelseslogg-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

const API_READ = /^\/api\/(alt|betting|entries|lunsj|vakter)$/;
const withTimeout = (p, ms) => new Promise((ok, no) => { const t = setTimeout(() => no(new Error("timeout")), ms); p.then((r) => { clearTimeout(t); ok(r); }, (e) => { clearTimeout(t); no(e); }); });

self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  // Push subscription settings and the like are never cached.
  if (url.pathname.startsWith("/api/") && !API_READ.test(url.pathname)) return;
  const isApi = url.pathname.startsWith("/api/");
  // API answers are saved without their ?v= version, and only full answers (not «same»).
  const key = isApi ? url.origin + url.pathname : req.mode === "navigate" ? url.origin + url.pathname : req.url;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const net = fetch(req).then(async (res) => {
      if (res.ok) {
        if (!isApi) await cache.put(key, res.clone());
        else { const j = await res.clone().json().catch(() => null); if (j && !j.same) await cache.put(key, res.clone()); }
      }
      return res;
    });
    try {
      return await withTimeout(net, isApi ? 6000 : 4000);
    } catch (err) {
      const hit = await cache.match(key) || (req.mode === "navigate" ? await cache.match(url.origin + "/") : null);
      if (hit) { net.catch(() => {}); return hit; }
      return net; // nothing saved: wait for the network after all
    }
  })());
});

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data.json(); } catch { d = { title: "Nytt bet", body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Nytt bet", {
    body: d.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: d.tag || "bet",
    renotify: true,
    vibrate: d.vibrate || [120, 60, 120],
    data: { url: d.url || "/#betting" },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url || "/#betting";
  e.waitUntil((async () => {
    const wins = await clients.matchAll({ type: "window", includeUncontrolled: true });
    const top = wins.find((w) => w.frameType !== "nested" && new URL(w.url).pathname === "/");
    if (top) { await top.focus(); return top.navigate ? top.navigate(url).catch(() => {}) : undefined; }
    return clients.openWindow(url);
  })());
});
