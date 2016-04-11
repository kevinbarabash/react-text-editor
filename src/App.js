import React, { Component } from 'react';
import { Provider } from 'react-redux';

import NodeEditor from './NodeEditor';
import prog from './prog';
import store from './store';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return <div>
            <h1>Program</h1>
            <Provider store={store}>
                <NodeEditor />
            </Provider>
        </div>;
    }
}
