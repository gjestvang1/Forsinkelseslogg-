// Only used for push notifications; pages are always fetched fresh.
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data.json(); } catch { d = { title: "Nytt bet", body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Nytt bet", {
    body: d.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "bet",
    renotify: true,
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
