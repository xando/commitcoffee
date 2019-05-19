import React from 'react';

import { Box, Grid, Button } from 'grommet';

import Map from './map';

import InfoSection from './info';
import FooterSection from './footer';
import HeaderSection from './header';

import SearchBox from './SearchBox';


export default class View extends React.Component {

    state = {
        lon: 5,
        lat: 34
    }

    searchChanged = (lon, lat) => {
        this.setState({ lon, lat });
    }

    render() {
        return (
            <Grid rows={["100vh", "100vh"]}>

                <Grid fill rows={["auto", "auto", "flex", "auto"]}>
                    <HeaderSection />

                    <Box pad="large">
                        <Button
                            label="Search"
                            primary={true}
                            color="accent-1"
                            href="#map"
                        />
                    </Box>

                    <InfoSection />
                    <FooterSection />
                </Grid>
                <Box id="map">
                    <Box pad="medium">
                        <SearchBox onChange={this.searchChanged} />
                    </Box>
                    <Map
                        fill
                        lon={this.state.lon}
                        lat={this.state.lat}
                    />
                </Box>
            </Grid>
        )
    }
}
