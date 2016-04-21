import { getValue } from './node_tools';

export default (state, action) => {
    const { selection, nodes } = state;

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
};
