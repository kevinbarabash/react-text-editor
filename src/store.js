import { createStore } from 'redux';
import gehry from 'gehry';

import prog from './prog';

const nodes = gehry.deconstruct(prog);
console.log(nodes);

const reducer = function(state = prog, action) {
    return nodes;
};

const store = createStore(reducer);

export default store;
