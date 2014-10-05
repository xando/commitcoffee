

def geometry(data):
    errors = {}
    required_fields = ['type', 'coordinates']

    for field in required_fields:
        if field not in data:
            errors[field] = "Required field"
        elif field == "type" and data[field] != "Point":
            errors[field] = "Required type for geometry 'type' is 'Point'"
        elif field == "coordinates":
            coordinates = data[field]
            try:
                float(coordinates[0])
                float(coordinates[1])
            except (ValueError, IndexError):
                errors[field] = "Required type for geometry 'coordinates' is [float, float]"

    return errors


def properties(data):
    errors = {}
    required_fields = ['name', 'country', 'city', 'address']

    for field in required_fields:
        if field not in data:
            errors[field] = "Required field"

    return errors


def type(data):

    if data != "Feature":
        return {
            'type': "Required 'type' is 'Feature'"
        }

    return {}
