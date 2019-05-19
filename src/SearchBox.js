import React from 'react';

import { TextInput } from 'grommet';


export default class SearchBox extends React.Component {

    state = { value: "" }

    onChange = e => this.setState({ value: e.target.value });

    onSubmit = (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (!this.state.value) {
            return
        }
        var geocoder = new google.maps.Geocoder();

        geocoder.geocode(
            { 'address': this.state.value },
            (results, status) => {
                if (status === 'OK') {
                    const { lat, lng } = results[0].geometry.location;
                    this.props.onChange(lng(), lat());
                }
            });
    }

    render = () => (
        <form onSubmit={this.onSubmit}>
            <TextInput
                placeholder="# Enter Location"
                value={this.state.search}
                onChange={this.onChange}
            />
        </form>
    )

}