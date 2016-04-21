import { getValue } from './node_tools';

const listLookup = {
    'CallExpression': 'arguments',
    'ArrayExpression': 'elements',
    'FunctionExpression': 'params',
};

export default (state, action) => {
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
                    selection: {id, pos},
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
                                selection: {id},
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
                                selection: {id},
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
        default:
            return state;
    }
};
