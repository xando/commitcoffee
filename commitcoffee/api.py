from django.http import JsonResponse
from django.contrib.gis.geos import Polygon
from django.contrib.gis.geos import Point

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
    geom = Polygon.from_bbox((
        request.GET['lng0'],
        request.GET['lat0'],
        request.GET['lng1'],
        request.GET['lat1']
    ))
    queryset = models.Place.objects.filter(location__within=geom)

    return JsonResponse(PlaceSerializer(queryset, many=True).data, safe=False)
