import { createStore } from 'redux';
import gehry from 'gehry';

import prog from './prog';

const nodes = gehry.deconstruct(prog);

const defaultState = {
    nodes: nodes,
    selection: null,
};

const LEFT_KEY = 37;
const RIGHT_KEY = 39;

const getValue = function(node) {
    if (node.type === 'NumberLiteral') {
        return node.value;
    } else if (node.type === 'StringLiteral') {
        return `"${node.value}"`;
    } else if (node.type === 'Identifier') {
        return node.name;
    }
};

const reducer = function(state = defaultState, action) {
    const { selection } = state;

    switch(action.type) {
        case 'KEY':
            if (selection && selection.pos != null) {
                let pos = selection.pos;
                const node = state.nodes[selection.id];
                const value = getValue(node);

                if (action.keyCode === LEFT_KEY) {
                    pos = Math.max(0, pos - 1);
                } else if (action.keyCode === RIGHT_KEY) {
                    pos = Math.min(value.length, pos + 1);
                }

                return {
                    ...state,
                    selection: {
                        ...selection,
                        pos: pos,
                    },
                };
            }
            return state;
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
