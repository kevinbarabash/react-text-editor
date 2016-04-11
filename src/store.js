import { createStore } from 'redux';

import prog from './prog';

const reducer = function(state = prog, action) {
    return {
        node: state
    };
};

const store = createStore(reducer);

export default store;
