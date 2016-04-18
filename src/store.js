import { createStore } from 'redux';

import prog from './prog';

const deconstruct = function(root) {
    if (root === null || root === undefined) {
        return null;
    }
    var nodes = [];
    var index = 0;
    var traverse = function (obj, parent = -1) {
        const id = index++;
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

        nodes[id] = result;
        return id;
    };

    traverse(root);
    return nodes;
};

const nodes = deconstruct(prog);

const defaultState = {
    nodes: nodes,
    selection: null,
};

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
    const { selection, nodes } = state;

    switch(action.type) {
        case 'MOVE_LEFT':
            if (selection && selection.pos != null) {
                let pos = selection.pos;
                let id = selection.id;

                const node = state.nodes[selection.id];

                if (pos === 0) {
                    const parent = state.nodes[node.parent];
                    if (parent.type === 'CallExpression') {
                        let index = parent.arguments.indexOf(id);
                        if (index > 0) {
                            index = Math.max(0, index - 1);
                            id = parent.arguments[index];
                            pos = getValue(nodes[id]).length;
                        }
                    } else if (parent.type === 'ArrayExpression') {
                        let index = parent.elements.indexOf(id);
                        if (index > 0) {
                            index = Math.max(0, index - 1);
                            id = parent.elements[index];
                            pos = getValue(nodes[id]).length;
                        }
                    } else if (parent.type === 'FunctionExpression') {
                        let index = parent.params.indexOf(id);
                        if (index > 0) {
                            index = Math.max(0, index - 1);
                            id = parent.params[index];
                            pos = getValue(nodes[id]).length;
                        }
                    }
                } else {
                    pos = pos - 1;
                }

                return {
                    ...state,
                    selection: {
                        id,
                        pos,
                    },
                };
            }

            return state;
        case 'MOVE_RIGHT':
            if (selection && selection.pos != null) {
                let pos = selection.pos;
                let id = selection.id;

                const node = state.nodes[selection.id];
                const value = getValue(node);

                if (pos === value.length) {
                    const parent = state.nodes[node.parent];
                    if (parent.type === 'CallExpression') {
                        const count = parent.arguments.length;
                        let index = parent.arguments.indexOf(id);
                        if (index !== -1 && index + 1 < count) {
                            index = index + 1;
                            id = parent.arguments[index];
                            pos = 0;
                        }
                    } else if (parent.type === 'ArrayExpression') {
                        const count = parent.elements.length;
                        let index = parent.elements.indexOf(id);
                        if (index !== -1 && index + 1 < count) {
                            index = index + 1;
                            id = parent.elements[index];
                            pos = 0;
                        }
                    } else if (parent.type === 'FunctionExpression') {
                        const count = parent.params.length;
                        let index = parent.params.indexOf(id);
                        if (index !== -1 && index + 1 < count ) {
                            index = index + 1;
                            id = parent.params[index];
                            pos = 0;
                        }
                    }
                } else {
                    pos = pos + 1;
                }

                return {
                    ...state,
                    selection: {
                        id,
                        pos,
                    },
                };
            }

            return state;
        case 'INSERT':
            if (selection && selection.id) {
                const node = state.nodes[selection.id];
                const parent = node.parent;

                let pos = selection.pos;

                if (node.type === 'StringLiteral') {
                    if (pos > 0 && pos < node.value.length + 2) {
                        const left = node.value.substring(0, pos - 1);
                        const right = node.value.substring(pos - 1);
                        const value = left + action.char + right;
                        pos += 1;

                        return {
                            ...state,
                            nodes: {
                                ...nodes,
                                [selection.id]: {
                                    ...node,
                                    value,
                                },
                            },
                            selection: {
                                ...selection,
                                pos: pos
                            },
                        };
                    }
                } else if (node.type === 'NumberLiteral') {
                    if (/[0-9\.]/.test(action.char)) {
                        if (action.char === '.' && node.value.includes('.')) {
                            return state;
                        }
                        const left = node.value.substring(0, pos);
                        const right = node.value.substring(pos);
                        const value = left + action.char + right;
                        pos += 1;

                        return {
                            ...state,
                            nodes: {
                                ...nodes,
                                [selection.id]: {
                                    ...node,
                                    value,
                                },
                            },
                            selection: {
                                ...selection,
                                pos: pos
                            },
                        };
                    }
                } else if (node.type === 'Placeholder') {
                    if (action.char === '"') {
                        return {
                            ...state,
                            nodes: {
                                ...nodes,
                                [selection.id]: {
                                    type: 'StringLiteral',
                                    value: '',
                                    parent,
                                },
                            },
                            selection: {
                                ...selection,
                                pos: 1
                            },
                        };
                    } else if (/[0-9\.]/.test(action.char)) {
                        return {
                            ...state,
                            nodes: {
                                ...nodes,
                                [selection.id]: {
                                    type: 'NumberLiteral',
                                    value: action.char,
                                    parent,
                                },
                            },
                            selection: {
                                ...selection,
                                pos: 1
                            },
                        };
                    }
                }
            }
            return state;
        case 'DELETE':
            if (selection && selection.id) {
                const node = state.nodes[selection.id];
                const parent = node.parent;
                let pos = selection.pos;

                if (node.type === 'StringLiteral') {
                    if (pos > 1 && pos < node.value.length + 2) {
                        const left = node.value.substring(0, pos - 2);
                        const right = node.value.substring(pos - 1);
                        const value = left + right;
                        pos -= 1;

                        return {
                            ...state,
                            nodes: {
                                ...nodes,
                                [selection.id]: {
                                    ...node,
                                    value,
                                },
                            },
                            selection: {
                                ...selection,
                                pos: pos
                            },
                        };
                    } else if (node.value.length === 0) {
                        return {
                            ...state,
                            nodes: {
                                ...nodes,
                                [selection.id]: {
                                    type: 'Placeholder',
                                    parent,
                                },
                            },
                            selection: {
                                ...selection,
                                pos: undefined,
                            },
                        };
                    }
                } else if (node.type === 'NumberLiteral') {
                    if (pos > 0) {
                        const left = node.value.substring(0, pos - 1);
                        const right = node.value.substring(pos);
                        const value = left + right;
                        pos -= 1;

                        if (value === '') {
                            return {
                                ...state,
                                nodes: {
                                    ...nodes,
                                    [selection.id]: {
                                        type: 'Placeholder',
                                        parent,
                                    },
                                },
                                selection: {
                                    ...selection,
                                    pos: undefined,
                                },
                            };
                        } else {
                            return {
                                ...state,
                                nodes: {
                                    ...nodes,
                                    [selection.id]: {
                                        ...node,
                                        value,
                                    },
                                },
                                selection: {
                                    ...selection,
                                    pos: pos
                                },
                            };
                        }
                    }
                }
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
