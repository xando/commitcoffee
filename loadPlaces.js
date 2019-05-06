export default () => {
    const context = require.context("../places");

    let palces = {
        type: 'FeatureCollection',
        features: []
    };

    context.keys().forEach((filename) => {
        for (const el of context(filename)) {

            if (!el.coordinates) {
                // TODO: some places not having right coordinages. 
                continue
            }

            palces.features.push({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    // TODO: 
                    // * coordinates are in the wrong order. 
                    // * coordianges are not keept as floats
                    coordinates: [
                        parseFloat(el.coordinates[1]),
                        parseFloat(el.coordinates[0])
                    ]
                },
                properties: {
                    name: el.name,
                    description: el.description
                }
            });
        }
    });
    return palces;
}
