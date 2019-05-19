import React from 'react';

import { Box, Text, Anchor } from 'grommet';


export default (props) => (

    <Box {...props} pad="large" background="dark-1">
        <Text size="medium" color="status-ok">
            # Is there a good coffee place missing? Would like to see it here?

            <br />
            # Please make a fork of the repository.

            <br />
            # (just in case you don't know how to use git ;)
        </Text>

        <Text
            margin={{ vertical: "medium" }}
            weight="600"
            size="medium"
            color="light-6">
            $ git clone&nbsp;

            <Anchor
                primary
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/xando/commitcoffee"
                label="https://github.com/xando/commitcoffee" />

        </Text>

        <Text size="medium" color="status-ok">
            # Create new <strong>places/‹your-github-username›.json</strong> file.
        </Text>

        <Text
            margin={{ vertical: "medium" }}
            weight="600"
            size="medium"
            color="light-6">
            $ git add <strong>places/xando.json</strong>
            <br />
            $ git commit -m "Bal Kraków, good coffee, decent wifi"
        </Text>

    </Box>
)
