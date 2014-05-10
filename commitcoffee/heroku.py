import dj_database_url

DEBUG = False
DATABASES = {
    'default': dj_database_url.config()
}
DATABASES['default']['ENGINE'] = 'django.contrib.gis.db.backends.postgis'
