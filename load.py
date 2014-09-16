#!/usr/bin/env python
import os
import sys
import json

from django.contrib.gis.geos import Point


if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "commitcoffee.settings")

    from commitcoffee import models
    import django
    django.setup()

    data = json.load(open('places.js'))

    for each in data:
        link = each.get('link', '')
        if link:
            homepage=link.get('homepage', '')
            facebook=link.get('facebook', '')
            twitter=link.get('twitter', '').split("/")[-1]
        else:
            homepage=''
            facebook=''
            twitter=''

        models.Place.objects.get_or_create(
            name=each['name'],
            city=each['city'],
            country=each['country'],
            address=each['address'],
            location=Point(float(each['coordinates'][1]), float(each['coordinates'][0])),
            homepage=homepage,
            facebook=facebook,
            twitter=twitter,
            published=True
        )
