from django.conf import settings
from django.conf.urls import patterns, include, url
from django.conf.urls.static import static
from django.contrib.staticfiles.views import serve

from rest_framework import routers

from commitcoffee import api

router = routers.DefaultRouter()
router.register(r'place', api.Place)


urlpatterns = static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += patterns(
    '',
    url(r'^api/search', api.ListUsers.as_view()),
    url(r'^api/', include(router.urls)),
    url(r'', lambda request: serve(request, 'index.html')),
)

