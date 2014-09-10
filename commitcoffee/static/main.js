function distance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var radlon1 = Math.PI * lon1/180
	var radlon2 = Math.PI * lon2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	if (unit=="K") { dist = dist * 1.609344 }
	if (unit=="N") { dist = dist * 0.8684 }
	return dist
}

angular.module('api', ['djangoRESTResources'])
	.factory('Place', function(djResource) {
		return djResource('/api/place/:id/', {id:'@id'});
	});



var app = angular.module(
	'application', ['api', 'ngRoute', 'ngResource', 'google-maps'],
	function($routeProvider, $resourceProvider, $httpProvider, $locationProvider) {

		$resourceProvider.defaults.stripTrailingSlashes = false;

		$locationProvider.html5Mode(true).hashPrefix('!');
		$httpProvider.defaults.xsrfCookieName = 'csrftoken';
		$httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

		$routeProvider
			.when('/', {
				templateUrl: '/static/templates/index.html',
				controller: 'index',

			})
			.when('/:latitude/:longitude', {
				templateUrl: '/static/templates/index.html',
				controller: 'index'
			})
			.when('/add', {
				templateUrl: '/static/templates/add.html',
				controller: 'add'
			});

	});

app.factory('$config', ['$location', '$rootScope', '$route', function($location, $rootScope, $route) {

	var lastRoute = $route.current;
	$rootScope.$on('$locationChangeSuccess', function (event) {
		if (lastRoute.$$route.originalPath === $route.current.$$route.originalPath) {
			$route.current = lastRoute;
		}
	});

	var config = {
		map: {
			center: {
				latitude: parseFloat($location.search().latitude ||  51.919438),
				longitude: parseFloat($location.search().longitude || 19.145136),
			},
			zoom: parseInt($location.search().z || 4),
			cluster_options: {
		  		gridSize: 10
			},
			events: {}
		},
		location: null
	}

	config.map.events.center_changed = function(map) {
		$location.search('latitude', config.map.center.latitude);
		$location.search('longitude', config.map.center.longitude);
		$location.search('z', config.map.zoom);
	}

	navigator.geolocation.getCurrentPosition(function(position) {
		config.location = {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		}
		if ($location.search().latitude == undefined &&
			$location.search().longitude == undefined) {
	  		config.map.center = {
	  			latitude: position.coords.latitude,
	  			longitude: position.coords.longitude
			}
			config.map.zoom = 10;
		}
	});

	return config;

}]);


app.controller('index', ['$scope', '$http', '$location', 'Place', '$config',
  function ($scope, $http, $location, Place, $config) {

	  angular.element('.angular-google-map-container').height(
		  angular.element(window).outerHeight(true) -
		  angular.element('footer').outerHeight(true) -
		  angular.element('#search').outerHeight(true)
	  );

	  angular.element('#list').height(
		  angular.element(window).outerHeight(true) -
		  angular.element('footer').outerHeight(true) -
		  angular.element('#search').outerHeight(true)
	  );

	  angular.element('#add').height(
		  angular.element(window).outerHeight(true) -
		  angular.element('footer').outerHeight(true) -
		  angular.element('#search').outerHeight(true)
	  );

	  $scope.items = [];
	  $scope.map = $config.map;
	  $scope.map.events.idle = function(map) {

	  	  var search = {
	  		  lat0: map.getBounds().getSouthWest().lat(),
	  		  lng0: map.getBounds().getSouthWest().lng(),
	  		  lat1: map.getBounds().getNorthEast().lat(),
	  		  lng1: map.getBounds().getNorthEast().lng(),
	  	  }
	  	  var search_query = decodeURIComponent($.param(search));

	  	  $http({method: 'GET', url: '/api/search?' + search_query})
	  		  .success(function(items, status, headers, config) {

	  			  if ($config.location) {
	  				  angular.forEach(items, function(item) {
	  			  		  item.distance = distance(
	  						  item.location.latitude,
	  						  item.location.longitude,
							  $config.location.latitude,
							  $config.location.longitude
	  					  ).toFixed(2);
	  				  })
	  			  	  $scope.items = _.sortBy(items, ['distance']);
	  			  } else {
	  				  $scope.items = items;
	  			  }

	  			  angular.forEach($scope.items, function(item, i) {
	  				  item.icon = '/static/img/map1.png';
	  			  	  item.click = function() {
	  					  this.model.icon = "/static/img/map2.png";
	  					  $scope.$apply();
	  			  	  }
	  			  });
	  		  })
	  		  .error(function(data, status, headers, config) {

	  		  });
	  }

}]);

app.controller('add', ['$scope', '$http', '$location', 'Place', '$config',
  function ($scope, $http, $location, Place, $config) {


	  angular.element('.angular-google-map-container').height(
		  angular.element(window).outerHeight(true) -
		  angular.element('footer').outerHeight(true) -
		  angular.element('#search').outerHeight(true)
	  );

	  angular.element('#list').height(
		  angular.element(window).outerHeight(true) -
		  angular.element('footer').outerHeight(true) -
		  angular.element('#search').outerHeight(true)
	  );

	  angular.element('#add').height(
		  angular.element(window).outerHeight(true) -
		  angular.element('footer').outerHeight(true) -
		  angular.element('#search').outerHeight(true)
	  );


	  $scope.map = $config.map;
	  $scope.map.events = {idle: null};

	  $scope.place = {
		  location: $scope.map.center
	  }
	  $scope.submit = function() {
		  Place.save($scope.place, function() {}, function(response) {
			  $scope.error = response.data;
		  })
	  }

}]);

// angular.module('api', ['ngResource']).
// 	// factory('Place', function($resource) {
// 	// 	return $resource('/api/restaurant/:id/', {}, {
// 	// 		query: {method:'GET', isArray:true}
// 	// 	});
// 	// }).
// 	factory('PlaceSearch', function($resource) {
// 		return $resource('/api/search', {}, {
// 			query: {method:'GET', isArray: true}
// 		});
// 	});

// var App = angular
// 	.module('CommitCoffee', ['api'])
// 	.config(['$locationProvider',function ($locationProvider) {
// 		$locationProvider.html5Mode(true);
// 	}]);


// App.controller('Controller', function ($scope, $location, $anchorScroll, PlaceSearch) {

// 	var searchCache = null;

// 	var mapOptions = {
// 		center: new google.maps.LatLng(40, -10),
// 		zoom: 3,
// 		mapTypeId: google.maps.MapTypeId.ROADMAP
// 	};

// 	var map = new google.maps.Map(
// 		document.getElementById("map-canvas"),
// 		mapOptions
// 	);

// 	function fetchLocations(coordinates) {
// 		PlaceSearch.query(coordinates, function(locations) {

// 			_.each(locations, function(location) {

// 				var position = new google.maps.LatLng(
// 					location.latitude,
// 					location.longitude
// 				);

// 				var marker = new google.maps.Marker({
// 					map: map,
// 					position: position,
// 					location: location
// 				});

// 				google.maps.event.addListener(marker, 'click', function() {
// 					self = this;
// 					$scope.$apply(function(){
// 						$scope.locationDetails = marker.location;
// 						$scope.showDetails = 2;
// 						$scope.mapsURL = encodeURIComponent(
// 							marker.location.latitude+','+marker.location.longitude
// 						)
// 					});
// 				});

// 			});
// 		});
// 	}

// 	google.maps.event.addListener(map, 'tilesloaded', function() {

// 		if (map.getZoom() > 7) {

// 			lat1 = map.getBounds().getNorthEast().lat();
// 			lng1 = map.getBounds().getNorthEast().lng();
// 			lat2 = map.getBounds().getSouthWest().lat();
// 			lng2 = map.getBounds().getSouthWest().lng();

// 			var coordinatesExpanded = {
// 				lat1: lat1 > 0 ? lat1 * 1.01 : lat1 * 0.99,
// 				lng1: lng1 > 0 ? lng1 * 1.01 : lng1 * 0.99,
// 				lat2: lat2 > 0 ? lat2 * 0.99 : lat2 * 1.01,
// 				lng2: lng2 > 0 ? lng2 * 0.99 : lng2 * 1.01,
// 			}

// 			if (!searchCache) {
// 				searchCache = coordinatesExpanded;
// 				fetchLocations(coordinatesExpanded);
// 			} else {

// 				if (searchCache.lat1 < lat1 ||
// 					searchCache.lng1 < lng1 ||
// 					searchCache.lat2 > lat2 ||
// 					searchCache.lng2 > lng2 ) {

// 					fetchLocations(coordinatesExpanded);
// 					searchCache = coordinatesExpanded;
// 				}
// 			}
// 		}
// 	});

// 	$scope.search = function (location) {

// 		$location.url('in/kraków');

// 		var geocoder = new google.maps.Geocoder();

// 		$scope.disabled = true;

// 		geocoder.geocode({'address': $scope.location}, function(results, status) {
// 			if (results.length > 0) {

// 				map.panTo(results[0].geometry.location);
// 				map.setZoom(14);
// 			}

// 			$scope.$apply(function(){
// 				$scope.disabled = false;
// 			});

// 		});
// 	}

// 	$scope.clickedSomewhereElse = function($event) {
// 		if ($scope.showDetails > 0) {
// 			--$scope.showDetails;
// 		}
// 	}

// });

// App.directive('clickAnywhereButHere', function($document){
//   return {
//     restrict: 'A',
//     link: function(scope, elem, attr, ctrl) {
//       elem.bind('click', function(e) {
//         e.stopPropagation();
//       });
//       $document.bind('click', function() {
//         scope.$apply(attr.clickAnywhereButHere);
//       })
//     }
//   }
// })
