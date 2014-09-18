from django.http import JsonResponse
from django.contrib.gis.geos import Polygon
from django.contrib.gis.geos import Point
from django.db.models import Q

from rest_framework import viewsets, serializers, views, response

from . import models


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
        attrs['location'] = Point(
            self.init_data['location']['longitude'],
            self.init_data['location']['latitude']
        )
        return attrs



class PlaceView(viewsets.ModelViewSet):
    model = models.Place
    serializer_class = PlaceSerializer


def search(request):

    lng0 = float(request.GET['lng0'])
    lat0 = float(request.GET['lat0'])

    lng1 = float(request.GET['lng1'])
    lat1 = float(request.GET['lat1'])

    if lng0 > lng1:

        geom_1 = Polygon.from_bbox((lng0, lat0, 180, lat1))
        geom_2 = Polygon.from_bbox((-180, lat0, lng1, lat1))
        queryset = models.Place.objects.filter(
            Q(location__contained=geom_1) | Q(location__contained=geom_2)
        )

    else:

        geom = Polygon.from_bbox((lng0, lat0, lng1,lat1))
        queryset = models.Place.objects.filter(location__contained=geom)


    return JsonResponse(PlaceSerializer(queryset, many=True).data, safe=False)
