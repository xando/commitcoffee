from django.conf.urls import include, url
from django.conf import settings
from django.views.static import serve
from django.conf.urls.static import static
from django.contrib import admin

from rest_framework.routers import DefaultRouter

from . import api


router = DefaultRouter()
router.register(r'place', api.PlaceView)


urlpatterns = [
    url(r'^api/search$', api.search),
    url(r'^api/', include(router.urls)),
    url(r'^admin/', include(admin.site.urls)),
    url(r'', lambda r: serve(r, 'templates/base.html', settings.STATIC_ROOT)),
]
