import React from 'react';
import ReactDOM from "react-dom";

import mapbox from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import SearchBox from './SearchBox';
import loadPlaces from './loadPlaces';

import { Heading, Box, Grommet, Text, Button, Layer } from 'grommet';

import 'normalize.css';

const theme = {
    global: {
        font: {
            family: 'Roboto',
            size: '14px',
            height: '20px',
        },
    },
    heading: {
        font: {
            family: 'Ubuntu Mono'
        }
    },
    text: {
        font: {
            family: 'Ubuntu Mono'
        }
    }

};


class App extends React.Component {

    constructor(props) {
        super(props);

        this.map = null;

        this.state = {
            lng: 5,
            lat: 34,
            zoom: 1.5,
            search: "Kraków",
            popup: null
        };
    }

    searchChanged = (lon, lng) => {
        this.map.flyTo({
            center: [lon, lng],
            zoom: 9,
            speed: 3.5,
        });
    }

    componentDidMount() {
        const { lng, lat, zoom } = this.state;

        this.map = new mapbox.Map({
            container: this.mapContainer,
            style: 'https://maps.tilehosting.com/styles/positron/style.json?key=1rAyLnCs2L6C0lW2bx2m',
            center: [lng, lat],
            zoom
        });

        this.map.on('move', () => {
            const { lng, lat } = this.map.getCenter();

            this.setState({
                lng: lng.toFixed(4),
                lat: lat.toFixed(4),
                zoom: this.map.getZoom().toFixed(2),
                popup: null
            });
        });

        this.map.on('load', () => {
            this.map.addLayer({
                "id": "places",
                "type": "circle",
                "source": {
                    "type": "geojson",
                    "data": loadPlaces()
                },
                "paint": {
                    "circle-color": "#11b4da",
                    "circle-radius": 7,
                    "circle-stroke-width": 1,
                    "circle-stroke-color": "#fff"
                }
            });
        })

        this.map.on('mouseenter', 'places', () => {
            this.map.getCanvas().style.cursor = 'pointer';
        });

        this.map.on('mouseleave', 'places', () => {
            this.map.getCanvas().style.cursor = '';
        });

        this.map.on('click', 'places', (e) => {
            const { name, description } = e.features[0].properties;
            let coordinates = e.features[0].geometry.coordinates.slice();

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
            // TODO:
            // * parsing JSON is not ideal heare.
            this.setState({ popup: { name, description: JSON.parse(description) } });
        });

    }

    closePopup = () => {
        this.setState({ popup: null });
    }

    render() {
        return (
            <Grommet theme={theme}>

                <Box
                    pad={{ horizontal: "large", vertical: "xsmall" }} 
                    background="dark-1">
                    <Heading
                        font="Roboto Mono">
                        $ commit -m "Coffee"
                    </Heading>
                </Box>

                <Box pad="large" 
                pad={{ horizontal: "large", vertical: "medium" }} 
                >
                    <Text size="medium" margin={{bottom: "small"}}>
                        # Enter the location and search for a geek friendly
                        coffee place near you with good WiFi and Coffee
                    </Text>

                    <SearchBox onChange={this.searchChanged} />
                </Box>

                <Box height="300px" ref={el => this.mapContainer = el} />

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
                            <Button margin={{top: "medium"}} label="close" onClick={this.closePopup} />
                        </Box>
                    </Layer>
                )}

                <Box pad="large">
                    <Text size="medium" color="neutral-1">
                        # Is there a good coffee place missing? Would like to see it here?

                        <br/>
                        # (just in case you don't know how to use git ;)

                        <br/>
                        # Please make a fork of the repository.
                    </Text>

                    <Text
                        margin={{ vertical: "medium" }}
                        weight="600"
                        size="medium"
                        color="dark-3">
                        $ git clone https://github.com/xando/commitcoffee
                    </Text>

                    <Text size="medium" color="neutral-1">
                        # Create new <strong>places/‹your-github-username›.json</strong> file like one of these and simply put you place there.
                    </Text>

                    <Text
                        margin={{ vertical: "medium" }}
                        weight="600"
                        size="medium"
                        color="dark-3">
                        $ git add <strong>places/xando.json</strong>
                        <br/>
                        $ git commit -m "Bal Kraków, good coffee decent wifi"
                    </Text>

                </Box>

                <Box pad="small">
                    <Text
                    textAlign="center"
                        size="small"
                        color="dark-3">
                        This website does not give a damn about cookies for now.
                    </Text>
                </Box>

            </Grommet>

        );
    }
}

ReactDOM.render(<App />, document.getElementById("app"));