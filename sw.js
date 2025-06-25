const CACHE_NAME = "v2";
const addResourcesToCache = async (resources) => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(resources);
};

self.addEventListener("install", (event) => {
    event.waitUntil(
        addResourcesToCache([
            "/",
            "/index.html",
            "/style.css",
            "/logic.js",
            "/sw.js",
            "/offline.json",
        ])
    );
    self.skipWaiting();
});


self.addEventListener("activate", (event) => {

    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.filter((cacheName) => cacheName !== CACHE_NAME).map((cacheName) => {

                    return caches.delete(cacheName);
                }),
            ),
        ),
    );
    event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
    let request = event.request;
    let url = new URL(request.url);
    if (url.origin === location.origin) {
        event.respondWith(
            caches.match(request).then((response) => {
                return response || fetch(request);
            })
        )
    } else {
        event.respondWith(
            caches.open("movie-save").then((cache) => {
                return fetch(request).then((response) => {
                    cache.put(request, response.clone());
                    return response;
                }).catch(() => {
                    return caches.match(request).then((response) => {
                        if (response) {
                            return response;
                        }
                        return caches.match("/offline.json");
                    });
                });
            })
        )
    }
})