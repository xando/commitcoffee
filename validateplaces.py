# -*- coding: utf-8 -*-
import json
import glob
import argparse
import itertools
import sys


OK, WRONG = True, False


def validate(input_data):
    try:
        data = json.loads(input_data)
    except ValueError as e:  # raised by json module if json is not valid
        return unicode(e), WRONG

    if not isinstance(data, list):
        return u"Places definition should be a *list* of places.", WRONG

    if not data:
        return u"There should be at least one place defined.", WRONG

    return data, OK


def parse_places(files):
    places = []

    for json_file_name in files:
        with open(json_file_name, 'r') as json_file:
            contents = json_file.read()

        data, ok = validate(contents)
        if ok:
            print("File '%s' is OK" % (json_file_name))
            places.extend(data)
        else:
            print("File '%s' is invalid: %s" % (json_file_name, data))
            sys.exit(1)

    return places


def prepare_json(places):
    def prepare_line(line):
        line = line.rstrip()
        line = line.replace('    ', '\t')
        return line

    places_json = json.dumps(places, indent=4)
    places_json = '\n'.join(
       prepare_line(line) for line in places_json.split('\n')
    )
    return places_json


def prepare_geojson(places):
    def place_addess(place):
        city = place.get('city')
        full_address = '%s' % (city) if city else ''

        country = place.get('country')
        full_address = '%s %s' % (full_address, country) if country else full_address

        address = place.get('address')
        full_address = '%s, %s' % (full_address, address) if address else full_address

        return full_address.strip()

    def place_info(place):
        desc = place.get('description')
        if desc:
            return (desc.get('Internet') or u'').strip()
        return u''

    def place_coordinates(place, reverse=False):
        # apperently geojson expects reverted ordering here
        coords = map(float, place.get('coordinates'))
        if reverse:
            coords.reverse()
        return coords

    def new_feature(place):
        return {
            'type': "Feature",
            'geometry': {
                'type': "Point",
                'coordinates': place_coordinates(place, reverse=True),
            },
            'properties': {
                'marker-symbol': "cafe",
                'name': place['name'],
                'address': place_addess(place),
                'info': place_info(place),
            },
        }

    def new_feature_collection(geojson_places):
        return {
            'type': "FeatureCollection",
            'features': geojson_places,
        }

    def has_coordinates(place):
        coords = place.get('coordinates')
        return coords is not None and len(coords) >= 2

    filtered_places = itertools.ifilter(has_coordinates, places)
    geojson = new_feature_collection([
        new_feature(place) for place in filtered_places
    ])
    return json.dumps(geojson, indent=4)


def save_file(file_name, content):
    with open(file_name, 'w') as output:
        output.write(content)
        output.write('\n')


def parse_args():
    parser = argparse.ArgumentParser(
        description = "CommitCoffee json validation tool.",
    )
    parser.add_argument("-o", "--output", action="store",
                        help="target file name where the merged places/*.json should go.")
    parser.add_argument("--geojson", action="store",
                        help="target file name where geojson data should be saved")
    return parser.parse_args()


def main(args):
    places = parse_places(
        glob.glob('places/*.json')
    )

    if args.output:
        places_json = prepare_json(places)
        save_file(args.output, "var places = %s;" % places_json)
        print("File '%s' generated" % (args.output))

    if args.geojson:
        places_geojson = prepare_geojson(places)
        save_file(args.geojson, places_geojson)
        print("File '%s' generated" % (args.geojson))


if __name__ == '__main__':
    main(parse_args())
