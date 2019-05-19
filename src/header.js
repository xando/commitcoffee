import React from 'react';

import { Box, Text, Heading } from 'grommet';


export default (props) => (
    <Box background="dark-1" pad={{
        horizontal: "large",
        vertical: "medium"
    }}
    >
        <Heading
            size="small"
            margin={{ vertical: "none" }}>
            $ commit -m "coffee"
        </Heading>

        <Text size="xsmall" margin={{ bottom: "none" }}>
            # where we keep geek friendly places
            (near you) with good WiFi and coffee
        </Text>
    </Box>
)