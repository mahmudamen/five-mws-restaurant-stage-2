let restaurant;
var map;
let modal = document.getElementById('add-review-modal');
let closeBtn = document.getElementsByClassName('close')[0];
/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = `Image of the ${restaurant.name}`;
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fetchReviews();
}
fetchReviews = () => {
	DBHelper.getReviewsByRestaurant(self.restaurant.id, (error, reviews) => {
		self.restaurant.reviews = reviews;
		fillReviewsHTML();
	});
}
/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');

  title.innerHTML = 'Reviews';
  container.appendChild(title);
  	if(!document.getElementById('toggle-review-modal') ){
		const addReviewButton = document.createElement('button');
		addReviewButton.id = 'toggle-review-modal';
		addReviewButton.innerHTML = 'Add Review';
		addReviewButton.onclick = () => {
			modal.style.display = 'block';
		};
		container.appendChild(addReviewButton);
	}

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'Not reviews ';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}
window.onload = (event) => {
	modal.style.display = 'none';
}
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (event) => {
	if(event.target == modal) {
		modal.style.display = 'none';
	}
}
/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}


addReview = () => {
	event.preventDefault();
	let restaurantId = getParameterByName('id');
	let name = document.getElementById('anon').value;
	let rating;
	let comments = document.getElementById('review-comments').value;

	let errors = [];
	let errorContainer = document.getElementById('form-error');

	// Basic Form Validation
	if(name.length < 5 || name.length > 30) errors.push('<p>Please enter a name with 5-30 characters.</p>');

	if(document.querySelector('input[name="rating"]:checked')) {
		rating = document.querySelector('input[name="rating"]:checked').value;
	} else {
		errors.push('<p>Please choose a rating.</p>');
	}
	if(comments.length > 250 || comments.length < 0) errors.push('<p>Please write comments with between 25-250 characters in length. </p>');

	if(errors.length > 0) {
		errorContainer.innerHTML = errors.join('');
		errorContainer.style.padding = '10px';
	} else {
		errorContainer.innerHTML = '';
		const review = [name, rating, comments, restaurantId];

		DBHelper.addReview(review, () => DBHelper.getReviewsByRestaurant(restaurantId, (error, reviews) => {
			self.restaurant.reviews = reviews;
			  fetchReviews();
		}));

		document.getElementById('review-form').reset();
		modal.style.display = 'none';
		 fetchReviews();
	}
}
/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
