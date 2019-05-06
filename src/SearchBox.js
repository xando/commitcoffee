import React from 'react';
import googleMaps from '@google/maps';

import { TextInput } from 'grommet';

const GoogleMaps = googleMaps.createClient({
    key: 'AIzaSyBIuem9zQdCPNBrV9atuN5fsrfMSBAuTLU'
});


export default class SearchBox extends React.Component {

    state = {value: ""}

    onChange = e => this.setState({ value: e.target.value });

    onSubmit = (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (!this.state.value) {
            return
        }

        GoogleMaps.geocode({
            address: this.state.value
        }, (err, response) => {
            if (!err) {
                const { lat, lng } = response.json.results[0].geometry.location;
                this.props.onChange(lng, lat);
            }
        });
    }

    render = () => (
        <form onSubmit={this.onSubmit}>
            <TextInput
                value={this.state.search}
                onChange={this.onChange}
            />
        </form>
    )

}