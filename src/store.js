import Immutable from 'immutable';
import { createStore } from 'redux';

import { generateId } from './reducers/node_tools';
import deleteReducer from './reducers/delete';
import insertReducer from './reducers/insert';
import navigateReducer from './reducers/navigate';
import selectReducer from './reducers/select';
import prog from './data/prog';

export const deconstruct = (root) => {
    if (root === null || root === undefined) {
        return null;
    }
    var nodes = Immutable.Map();
    var traverse = function (obj, parent = -1) {
        const id = generateId();
        const result = { parent };

        Object.keys(obj).forEach(key => {
            const val = obj[key];

            if (val == null) {
                result[key] = val;
            } else if (typeof val === "object") {
                if (Array.isArray(val)) {
                    result[key] = val.map(item => traverse(item, id));
                } else {
                    result[key] = traverse(val, id);
                }
            } else if (typeof val === "function") {
                result[key] = "[function]";
            } else {
                result[key] = val;
            }
        });

        nodes = nodes.set(id, result);
        return id;
    };

    traverse(root);
    return nodes;
};

const defaultState = {
    nodes: deconstruct(prog),
    selection: null,
};

const reducer = function(state = defaultState, action) {
    switch(action.type) {
        case 'MOVE_LEFT':
            return navigateReducer(state, action);
        case 'MOVE_RIGHT':
            return navigateReducer(state, action);
        case 'INSERT':
            return insertReducer(state, action);
        case 'DELETE':
            return deleteReducer(state, action);
        case 'SELECT':
            return selectReducer(state, action);
        default:
            return state;
    }
};

export default createStore(reducer);
