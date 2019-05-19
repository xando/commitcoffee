import React from 'react';
import ReactDOM from "react-dom";

import { ResponsiveContext, Grommet } from 'grommet';

import MobileView from './mobile';
import DesktopView from './desktop';

import 'normalize.css';


const theme = {
    global: {
        font: {
            family: 'Inconsolata',
            size: '14px',
            height: '20px',
        }
    }
};


class App extends React.Component {

    render() {
        return (
            <Grommet theme={theme} full={true}>
                <ResponsiveContext.Consumer>
                    {size => {
                        return (
                            size === 'small' ||
                                size === 'medium'
                                ? <MobileView />
                                : <DesktopView />
                        );
                    }}
                </ResponsiveContext.Consumer>
            </Grommet>
        );
    }
}

ReactDOM.render(<App />, document.getElementById("app"));