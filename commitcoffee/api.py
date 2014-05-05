from rest_framework import viewsets, serializers, views, response
from rest_framework import routers
from rest_framework.views import APIView
from rest_framework.response import Response
from commitcoffee import models


class SearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Place


class ListUsers(APIView):
    def get(self, request, format=None):

        latitude1 = float(request.GET.get('lat1', 0))
        latitude2 = float(request.GET.get('lat2', 0))

        longitude1 = float(request.GET.get('lng1', 0))
        longitude2 = float(request.GET.get('lng2', 0))

        query = models.Place.objects.filter(
            latitude__lte=latitude1,
            latitude__gte=latitude2,

            longitude__lte=longitude1,
            longitude__gte=longitude2,
        )

        serializer = SearchSerializer(query)

        return Response(serializer.data)


class Place(viewsets.ReadOnlyModelViewSet):
    model = models.Place
