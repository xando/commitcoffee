import os
import json
import sys

if __name__ == '__main__':

    os.environ['DJANGO_SETTINGS_MODULE'] = "settings"
    sys.path.append('commitcoffee')

    from commitcoffee import models
    places = json.loads(open('places.js').read())

    for each in places:
        print each['name']

        models.Place.objects.create(
            name=each['name'],
            city=each['city'],
            country=each['country'],
            address=each['address'],

            latitude = float(each["coordinates"][0]),
            longitude = float(each["coordinates"][1]),

            homepage=(each.get('link') or {}).get('homepage'),
            facebook=(each.get('link') or {}).get('facebook'),
            twitter=(each.get('link') or {}).get('twitter')
        )
