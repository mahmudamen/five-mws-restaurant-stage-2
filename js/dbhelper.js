/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */

  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }
  
static getAPIData(api, callback, id=null, param=null) {

		const port = 1337;
		let api_url;
		let fetch_options;

		switch(api) {
			case 'restaurants':
				api_url = `http://localhost:${port}/restaurants`;
				fetch_options = {method: 'GET'};
				break;
			case 'reviews':
				api_url = `http://localhost:${port}/reviews`;
				fetch_options = {method: 'GET'};
				break;
			case 'reviewById':
				api_url = `http://localhost:${port}/reviews/?restaurant_id=${id}`;
				fetch_options = {method: 'GET'};
				break;
			case 'addReview':
				api_url = `http://localhost:${port}/reviews`;
				
				const review = {
					"restaurant_id": parseInt(param[3]),
					"name": param[0],
					"rating": parseInt(param[1]),
					"comments": param[2]
				};

				fetch_options = {
					method: 'POST',
					body: JSON.stringify(review),
					headers: new Headers({
						'Content-Type': 'application/json'
					}) 
				};
				break;
			case 'fav':
				api_url = `http://localhost:${port}/restaurants/${id}/?is_favorite=${param}`;
				fetch_options = {method: 'PUT'};
				break;
			default:
				break;
		}

		fetch(api_url,fetch_options).then( (response) => {
			console.log(`Server: ${api} Called`);
			
			const contentType = response.headers.get('content-type');
			if(contentType && contentType.indexOf('application/json') !== -1 ) {
				return response.json();
			} else { 
				return 'API call successfull';
			}
		}).then( (data) => {
			callback(data);
		}).catch( error => console.error(error));

	};
  
  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    return DBHelper.getCachedRestaurants().then(restaurants => {
      if(restaurants.length) {
        return Promise.resolve(restaurants);
      } else {
        return DBHelper.addRestaurantsFromAPI();
      }
    })
    .then(restaurants=> {
      callback(null, restaurants);
    })
    .catch(error => {
      callback(error, null);
    })
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }
  	static addReview(review, callback) {

		callback();

		if(!navigator.onLine){
			// store locally
			localStorage.setItem('review', review);
			console.log('Local Storage: Review stored');
		} else {
			DBHelper.getAPIData('addReview', (data) => console.log(data), null, review);
			console.log('data sent to api');
		}
	}
	static getReviewsByRestaurant(restaurantId, callback) {
		DBHelper.getAPIData('reviewById', (reviews) => {
				console.log(reviews);
				callback(null, reviews);
		}, restaurantId);

	}
  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
	  if(!restaurant.photograph) restaurant.photograph = 10;
    return (`/img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }
  
  static openDatabase() {
    // If the browser doesn't support service worker,
    // we don't care about having a database
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }

    return idb.open('restaurantDb', 1, function(upgradeDb){
      var store = upgradeDb.createObjectStore('restaurantDb', {
        keyPath: 'id'
      });
      store.createIndex('by-id', 'id');
    });
  }

  static saveToDatabase(data){
    return DBHelper.openDatabase().then(function(db){
      if(!db) return;

      var tx = db.transaction('restaurantDb', 'readwrite');
      var store = tx.objectStore('restaurantDb');
      data.forEach(function(restaurant){
        store.put(restaurant);
      });
      return tx.complete;
    });
  }

  static addRestaurantsFromAPI(){
    return fetch(DBHelper.DATABASE_URL)
      .then(function(response){
        return response.json();
    }).then(restaurants => {
      DBHelper.saveToDatabase(restaurants);
      return restaurants;
    });
  }

  static getCachedRestaurants() {
    return DBHelper.openDatabase().then(function(db){
      if(!db) return;

      var store = db.transaction('restaurantDb').objectStore('restaurantDb');
      return store.getAll();
    });
  }

	static toggleFav(mode, id) {

		id = parseInt(id);

		// Check if restaurant idb exist, create otherwise
		let restaurantDbPromise = idb.open('restaurantDb', 1, (upgradeDB) => {
			let restaurantStore = upgradeDB.createObjectStore('restaurantDb', {keyPath: 'id'});
		});

		DBHelper.getAPIData('fav', () => {
			console.log(`Server: Restaurant ID ${id} updated!`)}, id, mode);

		restaurantDbPromise.then( db => {
			let tx = db.transaction('restaurantDb');
			let restaurantStore = tx.objectStore('restaurantDb');
			return restaurantStore.get(id);

		}).then(restaurant => {

			mode ? restaurant.is_favorite = true : restaurant.is_favorite = false;

			restaurantDbPromise.then( db => {
				let tx = db.transaction('restaurantDb', 'readwrite');
				let restaurantStore = tx.objectStore('restaurantDb');
				restaurantStore.put(restaurant);
				return restaurantStore.get(id);
			}).then( (restaurant) => console.log(`Restaurant ${restaurant.name} Favorized!`));
			
		});
	};
	

}



window.addEventListener('offline', (event) => {
	console.log('Browser: Offline now!');
});

window.addEventListener('online', (event) => {

	let review = localStorage.getItem('review');

	if(review !== null) {

		review = review.split(',');
		console.log(review);

		DBHelper.getAPIData('addReview', (data) => console.log(data), null, review);
		console.log('data sent to api');

		localStorage.removeItem('review');
		console.log('Local Storage: Review removed')
	}
	console.log('Browser: Online again!');
});
