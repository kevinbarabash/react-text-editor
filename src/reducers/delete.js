import { getValue } from './node_tools';

export default (state, action) => {
    const { selection, nodes, parents } = state;

    if (selection && selection.id) {
        const node = nodes.get(selection.id);
        const parent = parents.get(selection.id);
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
                    nodes: nodes.set(selection.id, { type: 'Placeholder' }),
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
                        nodes: nodes.set(selection.id, { type: 'Placeholder' }),
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
        } else if (node.type === 'Identifier') {
            if (pos > 0) {
                const left = node.name.substring(0, pos - 1);
                const right = node.name.substring(pos);
                const name = left + right;
                pos -= 1;

                if (name === '') {
                    return {
                        ...state,
                        nodes: nodes.set(selection.id, { type: 'Placeholder' }),
                        selection: {
                            ...selection,
                            pos: undefined,
                        },
                    };
                } else {
                    return {
                        ...state,
                        nodes: nodes.set(selection.id, { ...node, name }),
                        selection: {
                            ...selection,
                            pos: pos
                        },
                    };
                }
            }
        } else if (node.type === 'Placeholder') {
            const parentNode = nodes.get(parent);


            if (Array.isArray(parentNode)) {
                const grandparentNode = nodes.get(parents.get(parent));

                if (grandparentNode.type === 'MathExpression') {
                    const index = parentNode.indexOf(selection.id);
                    if (index > 0) {
                        // TODO: handle the case where there is no previous value
                        const prev = parentNode[index - 1];
                        const value = getValue(nodes.get(prev));

                        console.log(`prev = ${prev}`);
                        console.log(parentNode);
                        const filteredNodes = parentNode.filter(id => {
                            return id !== selection.id && id !== prev;
                        });
                        console.log(filteredNodes);

                        return {
                            ...state,
                            nodes: nodes.set(
                                parent,
                                filteredNodes
                            ),
                            selection: {
                                id: prev,
                                pos: value != null ? value.length : undefined,
                            },
                        };
                    }
                } else {
                    const index = parentNode.indexOf(selection.id);
                    if (index > 0) {
                        const prev = parentNode[index - 1];
                        const value = getValue(nodes.get(prev));

                        return {
                            ...state,
                            nodes: nodes.set(
                                parent,
                                parentNode.filter(id => id !== selection.id)
                            ),
                            selection: {
                                id: prev,
                                pos: value != null ? value.length : undefined,
                            },
                        };
                    }
                }
            }
        }
    }
    return state;
};
