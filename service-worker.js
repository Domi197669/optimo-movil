var CACHE = "optimo-v1";
var BASE = "/optimo-movil";
var URLS = [BASE + "/", BASE + "/index.html", BASE + "/manifest.json", BASE + "/assets/icons/icon.svg"];

self.addEventListener("install", function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(URLS); }));
  self.skipWaiting();
});

self.addEventListener("activate", function(e) {
  e.waitUntil(caches.keys().then(function(l) { return Promise.all(l.map(function(k) { if (k !== CACHE) return caches.delete(k); })); }));
  self.clients.claim();
});

self.addEventListener("fetch", function(e) {
  var url = new URL(e.request.url);
  if (!url.pathname.startsWith(BASE)) {
    if (url.origin === location.origin) {
      e.respondWith(caches.match(BASE + "/index.html").then(function(r) { return r || fetch(e.request); }));
      return;
    }
    e.respondWith(fetch(e.request).catch(function() { return caches.match(BASE + "/index.html"); }));
    return;
  }
  e.respondWith(caches.match(e.request).then(function(r) { return r || fetch(e.request).catch(function() { return caches.match(BASE + "/index.html"); }); }));
});

self.addEventListener("push", function(e) {
  var d = e.data ? e.data.json() : {};
  var op = {
    body: d.body || "Recordatorio de Óptimo Móvil",
    icon: BASE + "/assets/icons/icon.svg",
    badge: BASE + "/assets/icons/icon.svg",
    vibrate: d.vibrate || [200, 100, 200],
    data: { url: d.url || BASE + "/" },
    requireInteraction: true
  };
  e.waitUntil(self.registration.showNotification(d.title || "Óptimo Móvil", op));
});

self.addEventListener("notificationclick", function(e) {
  e.notification.close();
  var url = e.notification.data && e.notification.data.url ? e.notification.data.url : BASE + "/";
  e.waitUntil(clients.matchAll({type: "window"}).then(function(l) { for (var c of l) { if (c.url === url) { c.focus(); return; } } clients.openWindow(url); }));
});
