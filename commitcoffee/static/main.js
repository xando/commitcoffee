angular.module('api', ['ngResource']).
	// factory('Place', function($resource) {
	// 	return $resource('/api/restaurant/:id/', {}, {
	// 		query: {method:'GET', isArray:true}
	// 	});
	// }).
	factory('PlaceSearch', function($resource) {
		return $resource('/api/search', {}, {
			query: {method:'GET', isArray: true}
		});
	});

// var places = _.filter(places, "coordinates");

var App = angular
	.module('CommitCoffee', ['api'])
	.config(['$locationProvider',function ($locationProvider) {
		$locationProvider.html5Mode(true);
	}]);


App.controller('Controller', function ($scope, $location, $anchorScroll, PlaceSearch) {

	var searchCache = null;

	var mapOptions = {
		center: new google.maps.LatLng(40, -10),
		zoom: 3,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	var map = new google.maps.Map(
		document.getElementById("map-canvas"),
		mapOptions
	);

	function fetchLocations(coordinates) {
		PlaceSearch.query(coordinates, function(locations) {

			_.each(locations, function(location) {

				var position = new google.maps.LatLng(
					location.latitude,
					location.longitude
				);

				var marker = new google.maps.Marker({
					map: map,
					position: position,
					location: location
				});

				google.maps.event.addListener(marker, 'click', function() {
					self = this;
					$scope.$apply(function(){
						$scope.locationDetails = marker.location;
						$scope.showDetails = 2;
						$scope.mapsURL = encodeURIComponent(
							marker.location.latitude+','+marker.location.longitude
						)
					});
				});

			});
		});
	}

	google.maps.event.addListener(map, 'tilesloaded', function() {

		if (map.getZoom() > 7) {

			lat1 = map.getBounds().getNorthEast().lat();
			lng1 = map.getBounds().getNorthEast().lng();
			lat2 = map.getBounds().getSouthWest().lat();
			lng2 = map.getBounds().getSouthWest().lng();

			var coordinatesExpanded = {
				lat1: lat1 > 0 ? lat1 * 1.01 : lat1 * 0.99,
				lng1: lng1 > 0 ? lng1 * 1.01 : lng1 * 0.99,
				lat2: lat2 > 0 ? lat2 * 0.99 : lat2 * 1.01,
				lng2: lng2 > 0 ? lng2 * 0.99 : lng2 * 1.01,
			}

			if (!searchCache) {
				searchCache = coordinatesExpanded;
				fetchLocations(coordinatesExpanded);
			} else {

				if (searchCache.lat1 < lat1 ||
					searchCache.lng1 < lng1 ||
					searchCache.lat2 > lat2 ||
					searchCache.lng2 > lng2 ) {

					fetchLocations(coordinatesExpanded);
					searchCache = coordinatesExpanded;
				}
			}
		}
	});

	$scope.search = function (location) {

		$location.url('in/kraków');

		var geocoder = new google.maps.Geocoder();

		$scope.disabled = true;

		geocoder.geocode({'address': $scope.location}, function(results, status) {
			if (results.length > 0) {

				map.panTo(results[0].geometry.location);
				map.setZoom(14);
			}

			$scope.$apply(function(){
				$scope.disabled = false;
			});

		});
	}

	$scope.clickedSomewhereElse = function($event) {
		if ($scope.showDetails > 0) {
			--$scope.showDetails;
		}
	}

});

App.directive('clickAnywhereButHere', function($document){
  return {
    restrict: 'A',
    link: function(scope, elem, attr, ctrl) {
      elem.bind('click', function(e) {
        e.stopPropagation();
      });
      $document.bind('click', function() {
        scope.$apply(attr.clickAnywhereButHere);
      })
    }
  }
})
