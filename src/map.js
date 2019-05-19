import React from 'react';

import mapbox from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import loadPlaces from './loadPlaces';

import { Box, Button, Layer } from 'grommet';


export default class Map extends React.Component {

    static defaultProps = {
        lon: 5,
        lat: 34,
        zoom: 1.5
    }

    state = {
        popup: null
    };

    componentDidUpdate(prevProps) {

        this.map.flyTo({
            center: [this.props.lon, this.props.lat],
            zoom: 9,
            speed: 3.5,
        });

    }

    componentDidMount() {
        const { lon, lat, zoom } = this.props;
        this.map = new mapbox.Map({
            container: this.mapContainer,
            style: 'https://maps.tilehosting.com/styles/positron/style.json?key=1rAyLnCs2L6C0lW2bx2m',
            center: [lon, lat],
            zoom
        });

        this.map.on('load', () => {
            this.map.addSource("places", {
                type: "geojson",
                data: loadPlaces(),
                cluster: true,
                clusterMaxZoom: 8,
                clusterRadius: 50
            })

            this.map.addLayer({
                id: "unclustered-point",
                type: "circle",
                source: "places",
                filter: ["!", ["has", "point_count"]],
                paint: {
                    "circle-color": "#11b4da",
                    "circle-radius": 13,
                    "circle-stroke-width": 1,
                    "circle-stroke-color": "#fff"
                }
            });

            this.map.addLayer({
                id: "clusters",
                type: "circle",
                source: "places",
                filter: ["has", "point_count"],
                paint: {
                    "circle-color": [
                        "step",
                        ["get", "point_count"],
                        "#51bbd6",
                        20,
                        "#f1f075",
                        50,
                        "#f28cb1"
                    ],
                    "circle-radius": [
                        "step",
                        ["get", "point_count"],
                        18,
                        20,
                        20,
                        50,
                        25
                    ]
                }
            });

            this.map.addLayer({
                id: "cluster-count",
                type: "symbol",
                source: "places",
                filter: ["has", "point_count"],
                layout: {
                    "text-field": "{point_count_abbreviated}",
                    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                    "text-size": 12
                }
            });
        });

        this.map.on('mouseenter', 'unclustered-point', () => {
            this.map.getCanvas().style.cursor = 'pointer';
        });

        this.map.on('mouseleave', 'unclustered-point', () => {
            this.map.getCanvas().style.cursor = '';
        });

        this.map.on('mouseenter', 'clusters', () => {
            this.map.getCanvas().style.cursor = 'pointer';
        });

        this.map.on('mouseleave', 'clusters', () => {
            this.map.getCanvas().style.cursor = '';
        });

        this.map.on('click', 'clusters', (e) => {
            let coordinates = e.features[0].geometry.coordinates.slice();
            this.map.flyTo({
                center: coordinates,
                zoom: this.map.getZoom() + 3,
                speed: 3.5,
            });

        });

        this.map.on('click', 'unclustered-point', (e) => {
            const { name, description } = e.features[0].properties;
            let coordinates = e.features[0].geometry.coordinates.slice();

            // TODO:
            // parsing JSON is not ideal heare.
            this.setState({ popup: { name, description: JSON.parse(description) } });
        });
    }

    closePopup = () => {
        this.setState({ popup: null });
    }

    render() {
        return (
            <Box {...this.props}
                ref={el => this.mapContainer = el} >
                {this.state.popup && (
                    <Layer
                        onEsc={this.closePopup}
                        onClickOutside={this.closePopup}
                        margin="medium"
                    >
                        <Box pad="large" width="large">
                            <h1>
                                {this.state.popup.name}
                            </h1>
                            <div>
                                {Object.keys(this.state.popup.description).map(e =>
                                    <div key={e}>
                                        <strong>{e}</strong>: {this.state.popup.description[e]}
                                    </div>
                                )}
                            </div>
                            <Button margin={{ top: "medium" }} label="close" onClick={this.closePopup} />
                        </Box>
                    </Layer>
                )}

            </Box>
        )
    }
}

