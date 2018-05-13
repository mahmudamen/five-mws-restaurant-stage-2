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
			  './img/fav-icon.png',
      ];
      event.waitUntil(
    		caches.open('restaurant-cache-v1').then( (cache) => {
    			return cache.addAll(cacheurl);
    		})
    	);
});
self.addEventListener('sync', function(event) {
  if (event.tag == 'myFirstSync') {
    event.waitUntil(console.log('myFirstSync'));
  }
});


self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request).then( (response) => {
			if(response) return response;
			return fetch(event.request);
		}).catch( err => console.log(err))
	);
});
