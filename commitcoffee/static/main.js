function do_things_right() {

	angular.element('.list .list-group, #map-search').height(
		angular.element(window).outerHeight(true) -
		angular.element('#search').outerHeight(true) -
		angular.element('.submit').outerHeight(true) -
		angular.element('footer').outerHeight(true)
	);
}

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

	});


app.controller('index', ['$scope', '$http', '$location', 'Place', '$routeParams', '$rootScope',
  function ($scope, $http, $location, Place, $routeParams, $rootScope) {

	  $scope.safeApply = function(fn) {
		  var phase = this.$root.$$phase;
		  if(phase == '$apply' || phase == '$digest') {
			  if(fn && (typeof(fn) === 'function')) {
				  fn();
			  }
		  } else {
			  this.$apply(fn);
		  }
	  };

	  var pins = {}

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

	  if($location.search().q) {
		  (new google.maps.Geocoder()).geocode({'address': $location.search().q}, function(results, status) {
			  if (status == google.maps.GeocoderStatus.OK) {
				  if (results[0].geometry.viewport) {
					  console.log(map.getZoom());
					  map.fitBounds(
						  results[0].geometry.viewport
					  );
					  map.setZoom(map.getZoom()+1);
				  }
	  		  }
		  });
	  } else {
		  navigator.geolocation.getCurrentPosition(function(position) {

			  map.setCenter({
				  lat: position.coords.latitude,
				  lng: position.coords.longitude
			  });

			  map.setZoom(10);
		  });
	  }

	  $scope.search = function() {
	  	  $scope.disabled = true;
	  	  $scope.details = false;

	  	  var geocoder = new google.maps.Geocoder();

	  	  geocoder.geocode({'address': $scope.location}, function(results, status) {

	  		  if (status == google.maps.GeocoderStatus.OK) {
	  			  var location = results[0].geometry.location;

	  			  $location.search('q', $scope.location);

				  angular.element("#search input").blur();

				  if (results[0].geometry.viewport) {
					  console.log(map.getZoom());
					  map.fitBounds(
						  results[0].geometry.viewport
					  );
					  map.setZoom(map.getZoom()+1);
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
		  $scope.$apply();
	  });

	  google.maps.event.addListener(map, 'click', function() {
		  if ($scope.active) {
			  $scope.active.window.close();
		  }
		  $scope.active = null;
		  $scope.$apply();
	  });


	  google.maps.event.addListener(map, 'idle', function() {
		  google.maps.event.trigger(map, 'resize');

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
						  icon: '/static/img/map1.png',
						  customInfo: item,
					  });

					  var window = new google.maps.InfoWindow({
						  zIndex: 10000,
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

						  // safeApply
						  $scope.safeApply(function(){
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
		  google.maps.event.trigger(pins[item.id].marker, 'click');
	  }
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
