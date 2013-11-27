var places = _.filter(places, "coordinates");

var App = angular.module('CommitCoffee', []);

App.controller('Controller', function ($scope, $location) {

	var mapOptions = {
		center: new google.maps.LatLng(40, -10),
		zoom: 3,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	var map = new google.maps.Map(
		document.getElementById("map-canvas"),
		mapOptions
	);

	google.maps.event.addListener(map, 'tilesloaded', function() {

		var lat0 = map.getBounds().getNorthEast().lat();
		var lng0 = map.getBounds().getNorthEast().lng();
		var lat1 = map.getBounds().getSouthWest().lat();
		var lng1 = map.getBounds().getSouthWest().lng();

		var locationPlaces = _.filter(places, function(p) {
			if (lat1 <= parseFloat(p.coordinates[0]) &&
				parseFloat(p.coordinates[0]) <= lat0 &&
				lng1 <= parseFloat(p.coordinates[1]) &&
				parseFloat(p.coordinates[1]) <= lng0) {
				return true
			}
			return false
		});

		$scope.$apply(function(){
			$scope.results = locationPlaces;
		});

		_.each(locationPlaces, function(location) {
			var position = new google.maps.LatLng(
				location.coordinates[0],
				location.coordinates[1]
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
				});
			});

		});

	});

	$scope.search = function () {

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
