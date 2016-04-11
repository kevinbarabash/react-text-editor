import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import NodeEditor from './NodeEditor';
import store from './store';

render(<Provider store={store}>
    <NodeEditor />
</Provider>, document.getElementById('root'));
