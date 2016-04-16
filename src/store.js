import { createStore } from 'redux';
import gehry from 'gehry';

import prog from './prog';

const nodes = gehry.deconstruct(prog);

const reducer = function(state = nodes, action) {
    switch(action.type) {
        case 'SELECT':
            return {
                ...state,
                [action.id]: {
                    ...action.node,
                    selected: true,
                }
            };
        default:
            return state;
    }
};

const store = createStore(reducer);

export default store;
