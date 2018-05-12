importScripts('/js/idb.js');
self.addEventListener('install', (event) => {
      const cacheurl = [
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
              './img/10.webp',
      ];
      event.waitUntil(
    		caches.open('restaurant-cache-v1').then( (cache) => {
    			return cache.addAll(cacheurl);
    		})
    	);
});
self.addEventListener('activate', function(e){
    //console.log('[ServiceWorker] Activated');

    e.waitUntil(
        caches.keys().then(function(restaurant-cache-v1){
            return Promise.all(cacheNames.map(function(currentCacheName){
                if (currentCacheName !== restaurant-cache-v1) {
                    //console.log("[ServiceWorker] Removing Cached Files from", currentCacheName);
                    caches.delete(currentCacheName);
                }
            }))
        })
    )
})

self.addEventListener('sync', function(event) {
 
});


self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request).then( (response) => {
			if(response) return response;
			return fetch(event.request);
		}).catch( err => console.log(err))
	);
});
