import os
from django.conf import settings
from django.conf.urls import patterns, include, url
from django.conf.urls.static import static
from django.http import HttpResponse, CompatibleStreamingHttpResponse
from django.contrib.staticfiles.views import serve

from rest_framework import routers

from commitcoffee import api

router = routers.DefaultRouter()
router.register(r'place', api.Place)


def template(request, path):
    path = path or 'index.html'
    fullpath = os.path.join(settings.BASE_DIR, 'templates', path)
    return CompatibleStreamingHttpResponse(open(fullpath, 'rb'), "text/html")


urlpatterns = static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += patterns(
    '',
    url(r'^api/search', api.ListUsers.as_view()),
    url(r'^api/', include(router.urls)),
    url(r'(^(?P<path>[^/]+.html)$)|(^$)', template),
)
