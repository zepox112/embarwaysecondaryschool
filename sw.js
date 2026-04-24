// Jina la Cache - Badilisha v1 kuwa v2 ukifanya mabadiliko makubwa
const CACHE_NAME = 'embarway-smart-cache-v1';

// Mafaili ya lazima (Base assets)
const STATIC_ASSETS = [
    './',
    './index.html',
    './logo.jpg',
    './manifest.json'
];

// 1. Install Event: Inahifadhi mafaili ya msingi mara ya kwanza
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('SW: Inatengeneza hifadhi ya awali...');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// 2. Activate Event: Inasafisha cache za zamani ili isijaze RAM ya simu
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('SW: Inafuta takataka za zamani...');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// 3. Fetch Event: Mbinu ya "Network First"
// Hii inahakikisha mtumiaji anapata vitu vipya vikiwepo, na offline support kama hakuna net
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Kama internet ipo, hifadhi nakala mpya na urudishe jibu
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                // Kama internet imegoma, tumia nakala iliyopo kwenye simu
                return caches.match(event.request);
            })
    );
});