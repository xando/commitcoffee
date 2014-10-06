import json
import glob
import geohash
import hashlib

from django.http import JsonResponse
from django.contrib.gis.geos import Polygon
from django.contrib.gis.geos import Point
from django.db.models import Q

from rest_framework import viewsets, serializers, status, views
from rest_framework.response import Response

from . import models
from . import github
from . import validate


class PlaceSerializer(serializers.ModelSerializer):
    location = serializers.SerializerMethodField('get_location')

    class Meta:
        model = models.Place

    def get_location(self, obj):
        return {
            "latitude": obj.location.y,
            "longitude": obj.location.x
        }

    def validate_location(self, attrs, b):
        location = self.init_data.get('location')
        if location:
            attrs['location'] = Point(
                location['longitude'],
                location['latitude']
            )
        else:
            attrs['location'] = None

        return attrs


class PlaceView(views.APIView):
    def post(self, request):

        if request.DATA.get('things', None):
            return Response({}, status=status.HTTP_201_CREATED)

        errors = validate.properties(request.DATA)

        if errors:
            return Response(errors, status.HTTP_400_BAD_REQUEST)

        properties = request.DATA
        properties["marker-symbol"] = "bar"
        location = request.DATA["location"].values()[::-1]

        data = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": location
            },
            "properties": properties
        }

        branch_name = hashlib.md5(json.dumps(data)).hexdigest()
        sha = github.get_sha()

        github.create_branch(branch_name, sha)
        github.create_file(data, branch_name)
        github.create_pull_request(branch_name, properties['name'])

        return Response({}, status=status.HTTP_201_CREATED)


def places():
    places = []
    for file_name in glob.glob('places/*.geojson'):
        places.extend(json.load(open(file_name)))

    places_coords = []
    for place in places:
        lat, lng = place['geometry']['coordinates'] or [0, 0]
        lat, lng = float(lat), float(lng)
        place['id'] = geohash.encode(lat, lng)
        places_coords.append((lat, lng, place))

    return places_coords


def search(request):

    lng0 = float(request.GET['lng0'])
    lat0 = float(request.GET['lat0'])

    lng1 = float(request.GET['lng1'])
    lat1 = float(request.GET['lat1'])

    find = []
    for lat, lng, place in places():
        if lat0 < lat and lat < lat1 and lng0 < lng and lng < lng1:
            find.append(place)

    # import pdb; pdb.set_trace()
    # if lng0 > lng1:
    #     geom_1 = Polygon.from_bbox((lng0, lat0, 180, lat1))
    #     geom_2 = Polygon.from_bbox((-180, lat0, lng1, lat1))
    #     queryset = models.Place.objects.filter(
    #         Q(location__contained=geom_1) | Q(location__contained=geom_2)
    #     )

    # else:
    # geom = Polygon.from_bbox((lng0, lat0, lng1,lat1))
    #     queryset = models.Place.objects.filter(location__contained=geom)

    return JsonResponse(find, safe=False)
    # return JsonResponse(PlaceSerializer(queryset, many=True).data, safe=False)
