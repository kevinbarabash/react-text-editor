import { createStore } from 'redux';
import gehry from 'gehry';

import prog from './prog';

const nodes = gehry.deconstruct(prog);

const defaultState = {
    nodes: nodes,
    selectedNode: null,
};

const reducer = function(state = defaultState, action) {
    const { selectedNode } = state;

    switch(action.type) {
        case 'SELECT':
            return {
                ...state,
                selectedNode: selectedNode !== action.id ? action.id : null,
            };

        default:
            return state;
    }
};

const store = createStore(reducer);

export default store;
