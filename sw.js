self.addEventListener('install', e => {
  const timeStamp = Date.now();
  e.waitUntil(
    caches.open('restaurant').then(cache => {
      return cache.addAll([
			  './',
              './index.html',
              './restaurant.html',
              './css/styles.css',
              './css/model.css',
              './data/restaurants.json',
              './js/dbhelper.js',
              './js/main.js',
			        './js/idb.js',
              './js/restaurant_info.js',
              './img/1.webp',
              './img/2.webp',
              './img/3.webp',
              './img/4.webp',
              './img/5.webp',
              './img/6.webp',
              './img/7.webp',
              './img/8.webp',
              './img/9.webp',
              './img/10.webp'
      ])
          .then(() => self.skipWaiting());
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, {ignoreSearch: true}).then(response => {
      return response || fetch(event.request);
    })
  );
});
