import React from 'react';

import { Box, Text } from 'grommet';


export default (props) => (
    <Box {...props} pad="small">
        <Text
            textAlign="center"
            size="small"
            color="dark-3">
            This website does not give a damn about cookies for now.
        </Text>
    </Box>
)
