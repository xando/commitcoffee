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

        description = each.get('description', {})
        print description
        if isinstance(description, dict):
            description_internet = description.get("Internet", None) or description.get("internet", '')
            description_service = description.get("Service", None) or description.get("service", '')
            description_power = description.get("Power Outlets", None) or description.get("Power outlets", None) or  description.get("power outlets", '')
            description_provision = description.get("Provision", None) or description.get("provision", '')
            description_other = ". ".join([
                "%s, %s" % (name, value.lower()) for name, value in description.items() if name not in [
                    'Internet',
                    'internet',
                    'Power outlets',
                    'Power Outlets',
                    'power outlets',
                    'Provision',
                    'provision',
                    'Service',
                    'service']
            ])

        elif isinstance(description, str):
            description_other = description


        models.Place.objects.get_or_create(
            name=each['name'],
            city=each['city'],
            country=each['country'],
            address=each['address'],
            location=Point(float(each['coordinates'][1]), float(each['coordinates'][0])),
            homepage=homepage,
            facebook=facebook,
            twitter=twitter,
            published=True,

            description_internet=description_internet,
            description_service=description_service,
            description_power=description_power,
            description_provision=description_provision,
            description_other=description_other
        )
