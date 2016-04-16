import { createStore } from 'redux';
import gehry from 'gehry';

import prog from './prog';

const nodes = gehry.deconstruct(prog);

const defaultState = {
    nodes: nodes,
    selection: null,
};

const reducer = function(state = defaultState, action) {
    const { selection } = state;

    switch(action.type) {
        case 'SELECT':
            if (selection && selection.id === action.id && selection.pos === action.pos) {
                return {
                    ...state,
                    selection: null,
                };
            } else {
                return {
                    ...state,
                    selection: {
                        id: action.id,
                        pos: action.pos,
                    },
                };
            }

        default:
            return state;
    }
};

const store = createStore(reducer);

export default store;
