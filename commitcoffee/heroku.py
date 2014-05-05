from settings import *

import dj_database_url

DEBUG = False
DATABASES['default'] =  dj_database_url.config()
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
