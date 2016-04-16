import React, { Component } from 'react';
import { Provider } from 'react-redux';

import NodeEditor from './NodeEditor';
import store from './store';

export default class App extends Component {
    render() {
        return <div>
            <h1>Program</h1>
            <Provider store={store}>
                <NodeEditor />
            </Provider>
        </div>;
    }
}
