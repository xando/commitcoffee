# -*- coding: utf-8 -*-

from __future__ import print_function

import json
import glob
import sys

from commitcoffee import validate


GREEN = '\033[92m'
RED = '\033[91m'
ENDC = '\033[0m'


def print_ok(msg):
    print(u"%s\u2713 %s%s" % (GREEN, msg, ENDC))


def print_fail(msg):
    print(u"%s\u2717 %s%s" % (RED, msg, ENDC), file=sys.stderr)


def main():
    failed = False
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
                        failed = True
                        for field, error in errors.items():
                            print_fail("File %s, Place '%s': '%s' %s " % (
                                file_name, properties['name'], field, error)
                            )
                    else:
                        print_ok("File %s, Place '%s' ok " % (
                            file_name, properties['name'])
                        )

            except ValueError as e:
                print_fail("File %s" % e)
                failed = True

    if failed:
        sys.exit(1)


if __name__ == '__main__':
    main()
