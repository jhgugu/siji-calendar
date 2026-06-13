// 四季日历 Service Worker — 离线缓存
const CACHE_NAME = 'calendar-v2';
const ASSETS = [
    './',
    './calendar.html',
    './manifest.json'
];

// 安装：预缓存核心文件
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// 请求拦截：缓存优先，网络更新
self.addEventListener('fetch', event => {
    // 跳过 API 请求（天气、地理编码等）
    if (event.request.url.includes('api.') || event.request.url.includes('nominatim') ||
        event.request.url.includes('bigdatacloud') || event.request.url.includes('geocoding')) {
        return; // 不缓存 API 请求
    }
    event.respondWith(
        caches.match(event.request).then(cached => {
            const fetchPromise = fetch(event.request).then(response => {
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => cached);
            return cached || fetchPromise;
        })
    );
});
