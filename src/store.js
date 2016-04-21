import Immutable from 'immutable';
import { createStore } from 'redux';

import prog from './data/prog';

window.Immutable = Immutable;

let __id = 0;

const deconstruct = function(root) {
    if (root === null || root === undefined) {
        return null;
    }
    var nodes = Immutable.Map();
    var traverse = function (obj, parent = -1) {
        const id = __id++;
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

const listLookup = {
    'CallExpression': 'arguments',
    'ArrayExpression': 'elements',
    'FunctionExpression': 'params',
};

// TODO: move navigation code into a separate reducer
// TODO: cursorIsOnLeftEdge, cursorIsOnRightEdget
// TODO: getPreviousNode, getNextNode

const reducer = function(state = defaultState, action) {
    const { selection, nodes } = state;
    let node, id;

    switch(action.type) {
        case 'MOVE_LEFT':
            node = state.nodes.get(selection.id);
            id = selection.id;

            if (selection && selection.pos != null) {
                let pos = selection.pos;

                if (pos === 0) {
                    const parent = state.nodes.get(node.parent);
                    if (Object.keys(listLookup).includes(parent.type)) {
                        const list = parent[listLookup[parent.type]];
                        let index = list.indexOf(id);
                        if (index > 0) {
                            index = Math.max(0, index - 1);
                            id = list[index];
                            pos = getValue(nodes.get(id)).length;
                        }
                    }
                } else {
                    pos = pos - 1;
                }

                return {
                    ...state,
                    selection: { id, pos },
                };
            } else if (node.type === 'Placeholder') {
                const parent = state.nodes.get(node.parent);
                if (Object.keys(listLookup).includes(parent.type)) {
                    const list = parent[listLookup[parent.type]];
                    let index = list.indexOf(id);
                    if (index > 0) {
                        index = Math.max(0, index - 1);
                        id = list[index];
                        const prevNode = nodes.get(id);

                        if (prevNode.type === 'Placeholder') {
                            return {
                                ...state,
                                selection: { id },
                            };
                        } else {
                            return {
                                ...state,
                                selection: {
                                    id,
                                    pos: getValue(prevNode).length,
                                },
                            };
                        }
                    }
                }
            }

            return state;
        case 'MOVE_RIGHT':
            node = state.nodes.get(selection.id);
            id = selection.id;

            if (selection && selection.pos != null) {
                let pos = selection.pos;

                const value = getValue(node);

                if (pos === value.length) {
                    const parent = state.nodes.get(node.parent);
                    if (Object.keys(listLookup).includes(parent.type)) {
                        const list = parent[listLookup[parent.type]];
                        const count = list.length;
                        let index = list.indexOf(id);
                        if (index !== -1 && index + 1 < count) {
                            index = index + 1;
                            id = list[index];
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
            } else if (node.type === 'Placeholder') {
                const parent = state.nodes.get(node.parent);
                if (Object.keys(listLookup).includes(parent.type)) {
                    const list = parent[listLookup[parent.type]];
                    const count = list.length;
                    let index = list.indexOf(id);
                    if (index !== -1 && index + 1 < count) {
                        index = index + 1;
                        id = list[index];
                        const nextNode = nodes.get(id);

                        if (nextNode.type === 'Placeholder') {
                            return {
                                ...state,
                                selection: { id },
                            };
                        } else {
                            return {
                                ...state,
                                selection: {
                                    id,
                                    pos: 0,
                                },
                            };
                        }
                    }
                }
            }

            return state;
        case 'INSERT':
            if (selection && selection.id) {
                const node = state.nodes.get(selection.id);
                const parent = node.parent;
                const parentNode = state.nodes.get(node.parent);

                let pos = selection.pos;

                if (parentNode.type === 'CallExpression' && parentNode.arguments.includes(selection.id) &&
                        (node.type === 'Placeholder' || pos === getValue(node).length) && action.char === ',') {
                    const index = parentNode.arguments.indexOf(selection.id);
                    const newId = __id++;
                    const args = [...parentNode.arguments];
                    args.splice(index + 1, 0, newId);
                    return {
                        ...state,
                        nodes: nodes.set(parent, {
                            ...parentNode,
                            arguments: args,
                        }).set(newId, {
                            type: 'Placeholder',
                            parent: parent,
                        }),
                        selection: {
                            id: newId,
                        },
                    };
                }

                if (node.type === 'StringLiteral') {
                    if (pos > 0 && pos < node.value.length + 2) {
                        const left = node.value.substring(0, pos - 1);
                        const right = node.value.substring(pos - 1);
                        const value = left + action.char + right;
                        pos += 1;

                        return {
                            ...state,
                            nodes: nodes.set(selection.id, { ...node, value }),
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
                            nodes: nodes.set(selection.id, { ...node, value }),
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
                            nodes: nodes.set(selection.id, {
                                type: 'StringLiteral',
                                value: '',
                                parent,
                            }),
                            selection: {
                                ...selection,
                                pos: 1
                            },
                        };
                    } else if (/[0-9\.]/.test(action.char)) {
                        return {
                            ...state,
                            nodes: nodes.set(selection.id, {
                                type: 'NumberLiteral',
                                value: action.char,
                                parent,
                            }),
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
                const node = state.nodes.get(selection.id);
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
                            nodes: nodes.set(selection.id, { ...node, value }),
                            selection: {
                                ...selection,
                                pos: pos
                            },
                        };
                    } else if (node.value.length === 0) {
                        return {
                            ...state,
                            nodes: nodes.set(selection.id, { type: 'Placeholder', parent }),
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
                                nodes: nodes.set(selection.id, { type: 'Placeholder', parent }),
                                selection: {
                                    ...selection,
                                    pos: undefined,
                                },
                            };
                        } else {
                            return {
                                ...state,
                                nodes: nodes.set(selection.id, { ...node, value }),
                                selection: {
                                    ...selection,
                                    pos: pos
                                },
                            };
                        }
                    }
                } else if (node.type === 'Placeholder') {
                    const parentNode = nodes.get(parent);

                    if (parentNode.type === 'CallExpression' && parentNode.arguments.includes(selection.id)) {
                        const args = parentNode.arguments;
                        const prevArg = args[args.indexOf(selection.id) - 1];

                        return {
                            ...state,
                            nodes: nodes.set(parent, {
                                ...parentNode,
                                arguments: args.filter(arg => arg !== selection.id)
                            }),
                            selection: {
                                id: prevArg,
                                pos: getValue(nodes.get(prevArg)).length,
                            },
                        };
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
