import React from 'react';

import './App.css';
import mapboxgl from 'mapbox-gl';
import debounce from 'lodash/debounce';

import googleMaps from '@google/maps';

import {
    Box,
    Text,
    Flex
} from 'rebass'


const googleMapsClient = googleMaps.createClient({
    key: 'AIzaSyBIuem9zQdCPNBrV9atuN5fsrfMSBAuTLU'
});

class SearchBox extends React.Component {

    state = {
        value: "Kraków"
    }

    onChange = (e) => {
        this.setState({
            value: e.target.value
        })
    }

    onSubmit = (e) => {
        e.stopPropagation();
        e.preventDefault();

        googleMapsClient.geocode({
            address: this.state.value
        }, (err, response) => {
            if (!err) {
                const {lat, lng} = response.json.results[0].geometry.location;
                this.props.onChange(lng, lat);
            }
        });
    }

    render = () => (
        <form onSubmit={this.onSubmit}>
            <input
                value={this.state.search}
                onChange={this.onChange}
            />
        </form>
    )

}

class App extends React.Component {

    constructor(props) {
        super(props);

        this.map = null;
        this.state = {
            lng: 5,
            lat: 34,
            zoom: 1.5,
            search: "Kraków"
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

        this.map = new mapboxgl.Map({
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
                zoom: this.map.getZoom().toFixed(2)
            });
        });

    }

    render() {
        return (
            <div>
                <Flex>

                    <Box
                        p={5}
                        fontSize={4}
                        width={1}
                        color='white'
                        bg='black'>
                        <Text>
                            CommitCoffee
                        </Text>
                    </Box>

                </Flex>

                <Flex>
                    Enter the location and search for a geek friendly
                    coffee place near you with good WiFi and Coffee
                </Flex>

                <div>
                    Search
                    <SearchBox onChange={this.searchChanged}/>
                </div>

                <div ref={el => this.mapContainer = el} />

                <Flex>

                    <Box
                        p={5}
                        fontSize={4}
                        width={1}
                        color='white'
                        bg='black'>
                        <Text>
                            Is there a good coffee place missing? Would like to see it here?
                            Please make a fork of the repository.
                            Create new places/‹your-github-username›.json
                            file like one of these and simply put you place there.
                        </Text>
                    </Box>

                </Flex>


            </div>

        );
    }
}

export default App;
