import React, { Component } from 'react';
import { Provider } from 'react-redux';

import NodeEditor from './NodeEditor';
import store from './store';

export default class App extends Component {
    render() {
        const state = store.getState();
        const root = state[0];

        return <div>
            <h1>Program</h1>
            // <NodeEditor node={root} />
        </div>;
    }
}
