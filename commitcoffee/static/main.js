function do_things_right() {

	angular.element('.list .list-group, #map-search').height(
		angular.element(window).outerHeight(true) -
		angular.element('#search').outerHeight(true) -
		angular.element('.submit').outerHeight(true) -
		angular.element('footer').outerHeight(true) - 2
	);

	// angular.element('#details').height(angular.element('#map').height());

}

// angular.element(window).resize(function() {
// 	do_things_right();
// })
var map = null;

angular.module('api', ['djangoRESTResources'])
	.factory('Place', function(djResource) {
		return djResource('/api/place/:id/', {id:'@id'});
	});


var app = angular.module(
	'application', ['api', 'ngRoute', 'ngResource'],
	function($routeProvider, $resourceProvider, $httpProvider, $locationProvider) {

		$resourceProvider.defaults.stripTrailingSlashes = false;

		$locationProvider.html5Mode(true).hashPrefix('!');
		$httpProvider.defaults.xsrfCookieName = 'csrftoken';
		$httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

		$routeProvider
			.when('/', {
				templateUrl: '/static/templates/index.html',
				controller: 'index',
				// reloadOnSearch: false,

			})
			.when('/:id/:name', {
				templateUrl: '/static/templates/details.html',
				controller: 'details'
			})
			.when('/add', {
				templateUrl: '/static/templates/add.html',
				controller: 'add',
				// reloadOnSearch: false,
			});

	})


app.controller('search', ['$scope', '$http', '$location', 'Place', '$routeParams', '$route',
  function ($scope, $http, $location, Place, $routeParams, $route) {

	  do_things_right();


  }])

var pins = {}

app.controller('index', ['$scope', '$http', '$location', 'Place', '$routeParams', '$rootScope',
  function ($scope, $http, $location, Place, $routeParams, $rootScope) {

	  do_things_right();

	  $scope.latitude = 39.1846;
	  $scope.longitude = -42.705444;
	  $scope.active = null;

	  var options = {
          center: {
			  lat: $scope.latitude,
			  lng: $scope.longitude
		  },
          zoom: 3,
	  	  zoomControl: true,
	  	  mapTypeControl: false,
	  	  streetViewControl: false,
		  disableDoubleClickZoom: true
      };

      var map = new google.maps.Map($('#map-search')[0], options);

	  $scope.search = function() {
	  	  $scope.disabled = true;
	  	  $scope.details = false;

	  	  var geocoder = new google.maps.Geocoder();
	  	  geocoder.geocode({'address': $scope.location}, function(results, status) {

	  		  if (status == google.maps.GeocoderStatus.OK) {
	  			  var location = results[0].geometry.location;

				  // $location
				  // 	  .path("/")
				  // 	  .search('x', location.lng().toFixed(6))
				  // 	  .search('y', location.lat().toFixed(6))

				  angular.element("#search input").blur();

				  if (results[0].geometry.viewport && $scope.map.control !== undefined) {
					  var map = $scope.map.control.getGMap();
					  map.fitBounds(
						  results[0].geometry.viewport
					  );
				  }
	  		  }

	  		  $scope.disabled = false;
	  		  $scope.$apply();
	  	  });
	  }



	  google.maps.event.addListener(map, 'zoom_changed', function() {
		  if ($scope.active) {
			  $scope.active.window.close();
		  }
		  $scope.active = null;
	  });

	  google.maps.event.addListener(map, 'click', function() {
		  if ($scope.active) {
			  $scope.active.window.close();
		  }
		  $scope.active = null;
	  });


	  google.maps.event.addListener(map, 'idle', function() {
		  google.maps.event.trigger(map, 'resize');

	  	  // $location
	  	  // 	  .path("/")
	  	  // 	  .search('x', map.getCenter().lng().toFixed(6))
	  	  // 	  .search('y', map.getCenter().lat().toFixed(6))
	  	  // 	  .search('z', map.getZoom());

	  	  // history.pushState(null, null, $location.url());

	  	  var search = {
	  	  	  lat0: map.getBounds().getSouthWest().lat(),
	  	  	  lng0: map.getBounds().getSouthWest().lng(),
	  	  	  lat1: map.getBounds().getNorthEast().lat(),
	  	  	  lng1: map.getBounds().getNorthEast().lng(),
	  	  }

	  	  var url = '/api/search?' + decodeURIComponent($.param(search));
	  	  $http({method: 'GET', url: url, cache: true})
	  		  .success(function(items, status, headers, config) {
	  			  $scope.items = items;

				  angular.forEach($scope.items, function(item, i) {

					  var marker = new google.maps.Marker({
						  position: new google.maps.LatLng(
							  item.location.latitude,
							  item.location.longitude
						  ),
						  map: map,
						  // icon: '/static/img/map1.png',
						  customInfo: item,
					  });


					  var content = '<div class="window">' +
						  '<h3>' + item.name + '<small> ' + item.address + '</small></h3>';

					  var window = new google.maps.InfoWindow({
						  pixelOffset: (new google.maps.Size(0, 46))
					  });

					  pins[item.id] = {
						  marker: marker,
						  window: window
					  }

					  google.maps.event.addListener(marker, 'click', function(a,b) {
						  var el = angular.element('#item-' + item.id)[0];
	  			  	  	  var elp = el.parentNode;

	  			  	  	  if (el.getBoundingClientRect().bottom > elp.getBoundingClientRect().bottom ||
	  			  	  	  	  el.getBoundingClientRect().top < elp.getBoundingClientRect().top) {
	  			  	  	  	  el.scrollIntoView();
	  			  	  	  }

						  $scope.$apply(function(){
							  if ($scope.active) {
								  $scope.active.window.close();
							  }
						  	  $scope.active = {
								  item: item,
								  window: window
							  }

							  $scope.active.window.setContent(
								  $('#item-'+ item.id +'-window').html()
							  )
							  $scope.active.window.open(map, marker);
						  });
					  });
				  });
	  		  });
	  });

	  $scope.show_details = function(item) {
		  if ($scope.active) {
			  $scope.active.window.close();
		  }

		  var pin = pins[item.id];

		  $scope.active = {
			  item: item,
			  window: pin.window
		  }

		  $scope.active.window.open(map, pin.marker);
	  }


	  			  // angular.forEach($scope.map.items, function(item, i) {
	  			  // 	  item.icon = '/static/img/map1.png';

	  			  // 	  item.close = function() {
	  			  // 		  $scope.details = false;
	  			  // 		  $scope.$apply();
	  			  // 	  }

	  			  // 	  item.click = function() {
	  			  // 	  	  var el = angular.element('#item-' + this.model.id)[0];
	  			  // 	  	  var elp = el.parentNode;

	  			  // 	  	  if (el.getBoundingClientRect().bottom > elp.getBoundingClientRect().bottom ||
	  			  // 	  	  	  el.getBoundingClientRect().top < elp.getBoundingClientRect().top) {
	  			  // 	  	  	  el.scrollIntoView();
	  			  // 	  	  }
	  			  // 	  	  $scope.details = this.model;
	  		  // }
	  				  // });
	  // $rootScope.map_zoom = 3;

	  // $scope.map = {
	  // 	  center: $rootScope.map_center,
	  // 	  zoom: $rootScope.map_zoom,
	  // 	  events: {},
	  // 	  items: [],
	  // 	  markers: {},
	  // 	  windows: {},
	  // 	  options: {
	  // 		  disableDefaultUI: true
	  // 	  },
	  // 	  control: {}

	  // }

	  // $scope.details = false;
	  // $scope.current_location = null;

	  // var setup_map = function() {
	  // 	  var search = $location.search();
	  // 	  if ('x' in search &&
	  // 		  'y' in search &&
	  // 		  'z' in search) {

	  // 		  $scope.map.center.latitude = parseFloat(search.y);
	  // 		  $scope.map.center.longitude = parseFloat(search.x);
	  // 		  $scope.map.zoom = parseInt(search.z);
	  // 	  } else {

	  // 		  // navigator.geolocation.getCurrentPosition(function(position) {
	  // 		  // 	  angular.copy(position.coords, $scope.current_location);

	  // 		  // 	  $scope.map.center.latitude = position.coords.latitude;
	  // 		  // 	  $scope.map.center.longitude = position.coords.longitude;
	  // 		  // 	  $scope.map.zoom = 13;

	  // 		  // });
	  // 	  }
	  // }

	  // $scope.$on('$routeUpdate', function(next, current) {
	  // 	  setup_map();
	  // });

	  // setup_map();

	  // $scope.map.events.dragstart = function(map) {
	  // 	  $scope.details = false;
	  // }

	  // $scope.map.events.projection_changed = function(map) {
	  // 	  angular.element('#details').height(angular.element('#map').height());
	  // }

	  // $scope.$watch('details', function(newValue, oldValue) {
	  // 	  if (newValue) {
	  // 		  // angular.forEach($scope.map.windows.getChildWindows().values(), function(window, i) {
	  // 		  // 	  if (window.model.id === newValue.id) {
	  // 		  // 		  window.showWindow();
	  // 		  // 	  } else {
	  // 		  // 		  window.hideWindow();
	  // 		  // 	  }
	  // 		  // });

	  // 		  angular.forEach($scope.map.markers.getGMarkers(), function(marker, i) {
	  // 			  if (marker.key === newValue.id) {
	  // 			  	  marker.setIcon("/static/img/map2.png");
	  // 			  } else {
	  // 			  	  marker.setIcon("/static/img/map1.png");
	  // 			  }
	  // 		  });
	  // 	  } else {
	  // 		  angular.forEach($scope.map.markers.getGMarkers(), function(marker, i) {
	  // 	  		  marker.setIcon("/static/img/map1.png");
	  // 	  	  });
	  // 		  // angular.forEach($scope.map.windows.getChildWindows().values(), function(window, i) {
	  // 			  // window.hideWindow();
	  // 		  // });
	  // 	  }
	  // });

	  // $scope.map.events.idle = function(map) {

	  // 	  $location
	  // 	  	  .path("/")
	  // 	  	  .search('x', map.getCenter().lng().toFixed(6))
	  // 	  	  .search('y', map.getCenter().lat().toFixed(6))
	  // 	  	  .search('z', map.getZoom());

	  // 	  history.pushState(null, null, $location.url());

	  // 	  var search = {
	  // 	  	  lat0: map.getBounds().getSouthWest().lat(),
	  // 	  	  lng0: map.getBounds().getSouthWest().lng(),
	  // 	  	  lat1: map.getBounds().getNorthEast().lat(),
	  // 	  	  lng1: map.getBounds().getNorthEast().lng(),
	  // 	  }

	  // 	  var url = '/api/search?' + decodeURIComponent($.param(search));
	  // 	  $http({method: 'GET', url: url, cache: true})
	  // 		  .success(function(items, status, headers, config) {
	  // 			  $scope.map.items = items;
	  // 			  angular.forEach($scope.map.items, function(item, i) {
	  // 			  	  item.icon = '/static/img/map1.png';

	  // 				  item.close = function() {
	  // 					  $scope.details = false;
	  // 					  $scope.$apply();
	  // 				  }

	  // 			  	  item.click = function() {
	  // 			  	  	  var el = angular.element('#item-' + this.model.id)[0];
	  // 			  	  	  var elp = el.parentNode;

	  // 			  	  	  if (el.getBoundingClientRect().bottom > elp.getBoundingClientRect().bottom ||
	  // 			  	  	  	  el.getBoundingClientRect().top < elp.getBoundingClientRect().top) {
	  // 			  	  	  	  el.scrollIntoView();
	  // 			  	  	  }
	  // 			  	  	  $scope.details = this.model;
	  // 			  	  }
	  // 			  });
	  // 		  });
									// }
}]);

app.controller('add', ['$scope', '$http', '$location', 'Place', '$rootScope', '$timeout',
  function ($scope, $http, $location, Place, $rootScope, $timeout) {

	  $scope.place = {
		  loction: {}
	  };

	  $scope.latitude = 39.1846;
	  $scope.longitude = -42.705444;

	  var options = {
          center: {
			  lat: $scope.latitude,
			  lng: $scope.longitude
		  },
          zoom: 3,
		  scrollwheel: false,
	  	  zoomControl: true,
	  	  mapTypeControl: false,
	  	  streetViewControl: false,

      };

      var map = new google.maps.Map($('#map-add')[0], options);

	  google.maps.event.addListenerOnce(map, 'projection_changed', function() {
		  var marker = $('<img src="/static/img/map2.png" class="marker"/>')
	  		  .appendTo("#map-add");
		  marker.css('top', marker.position().top - 51);
		  marker.css('left', marker.position().left - 17);
	  });
	  google.maps.event.trigger(map, 'projection_changed');

	  google.maps.event.addListener(map, 'dragstart', function() {
		  google.maps.event.trigger(map, 'resize');
	  	  $('input').blur();
	  });

	  google.maps.event.addListener(map, 'idle', function() {
		  google.maps.event.trigger(map, 'resize');
	  });

	  google.maps.event.addListener(map, 'center_changed', function() {
		  $scope.place.location = {
			  latitude: map.getCenter().lat(),
			  longitude: map.getCenter().lng()
		  }
		  $scope.$apply();
	  });


	  var address_timer=false;
	  $scope.$watch(
	  	  function() {
	  		  return $scope.place.address +
	  			     $scope.place.city +
	  			     $scope.place.country;
	  	  },
	  	  function() {
	  		  if(address_timer){
	  			  $timeout.cancel(address_timer)
	  		  }
	  		  address_timer = $timeout(function(){
	  			  var country = ($scope.place.country || '');
	  			  var city = ($scope.place.city || '');
	  			  var address = ($scope.place.address || '');
	  			  var full_address = country+' '+city+' '+address;

	  			  if (full_address.length > 2) {
	  				  var geocoder = new google.maps.Geocoder();
	  				  geocoder.geocode({'address': full_address}, function(results, status) {
	  					  if (status == google.maps.GeocoderStatus.OK) {
	  						  var location = results[0].geometry.location;
							  map.setCenter(location);
	  						  $scope.$apply();
	  						  if (results[0].geometry.viewport) {
	  						  	  map.fitBounds(
	  						  		  results[0].geometry.viewport
	  						  	  );
	  						  }
	  					  }
	  				  });
	  			  }
	  		  }, 1000);
	  	  }
	  );

	  $scope.submit = function() {
	  	  Place.save($scope.place, function() {
	  	  	  $scope.submited = true;
	  	  	  $scope.error = response.data;
	  	  }, function(response) {
	  	  })
	  }

	  $scope.back = function() {
	  	  history.go(-1);
	  }

}]);
