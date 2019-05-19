import React from 'react';

import { Box } from 'grommet';

import Map from './map';
import SearchBox from './SearchBox';

import Info from './info';
import Footer from './footer';
import Header from './header';


export default class View extends React.Component {

    state = {
        lon: 5,
        lat: 34
    }

    searchChanged = (lon, lat) => {
        this.setState({lon, lat});
    }

    render() {
        return (
            <Box>
                
                <Header />

                <Box
                    pad="large"
                    pad={{ horizontal: "large", vertical: "medium" }}>
                    <SearchBox onChange={this.searchChanged} />
                </Box>
                
                <Map
                    height="400px"
                    lon={this.state.lon}
                    lat={this.state.lat}
                />
                
                <Info />
                <Footer />

            </Box>
        )
    }
}