# -*- coding: utf-8 -*-

from __future__ import print_function

import json
import glob
import sys

from commitcoffee import validate


def merge():
    pass


def main():
    for file_name in glob.glob('places/*.geojson'):
        with open(file_name) as f:
            try:
                places = json.loads(f.read())
                for each in places:
                    errors = {}

                    geometry = each.get('geometry', {})
                    properties = each.get('properties', {})
                    type = each.get('type', {})

                    errors.update(validate.geometry(geometry))
                    errors.update(validate.properties(properties))
                    errors.update(validate.type(type))

                    if errors:
                        for field, error in errors.items():
                            print(u"\u2717 File %s, Place '%s': '%s' %s " % (
                                file_name,
                                properties['name'],
                                field, error), file=sys.stderr)
                    else:
                        print(u"\u2713 File %s, Place '%s' ok " % (
                            file_name,
                            properties['name'])
                        )

            except ValueError as e:
                print(" E %s" % e)


if __name__ == '__main__':
    main()
