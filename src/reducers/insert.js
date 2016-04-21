import { getValue, generateId } from './node_tools';

export default (state, action) => {
    const { selection, nodes } = state;

    if (selection && selection.id) {
        const node = state.nodes.get(selection.id);
        const parent = node.parent;
        const parentNode = state.nodes.get(node.parent);

        let pos = selection.pos;

        if (parentNode.type === 'CallExpression' && parentNode.arguments.includes(selection.id) &&
            (node.type === 'Placeholder' || pos === getValue(node).length) && action.char === ',') {
            const index = parentNode.arguments.indexOf(selection.id);
            const newId = generateId();
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
};