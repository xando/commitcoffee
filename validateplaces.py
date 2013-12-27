# -*- coding: utf-8 -*-
import json
import glob
import argparse


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


def parse_args():
    parser = argparse.ArgumentParser(
        description = "CommitCoffee json validation tool.",
    )
    parser.add_argument("-o", "--output", action="store",
                        help="target file name where the merged places/*.json should go.")
    return parser.parse_args()


def main(args):
    places = parse_places(
        glob.glob('places/*.json')
    )

    places_json = prepare_json(places)

    if args.output:
        with open(args.output, 'w') as output:
            output.write("var places = %s;\n" % places_json)
        print("File '%s' generated" % (args.output))


if __name__ == '__main__':
    main(parse_args())
