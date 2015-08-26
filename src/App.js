import React, { Component } from 'react';

import NodeEditor from './NodeEditor';
import prog from './prog';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    
    render() {
        return <div>
            <h1>Program</h1>
            <NodeEditor node={prog} />
        </div>;
    }
}
