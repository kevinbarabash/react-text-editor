import { getValue, generateId } from './node_tools';
import { orderings } from '../data/ast_data';

export default (state, action) => {
    const { selection, nodes, parents } = state;

    if (selection && selection.id) {
        const node = nodes.get(selection.id);
        const parent = parents.get(selection.id);
        const parentNode = nodes.get(parent);

        let pos = selection.pos;

        if (Array.isArray(parentNode) && action.char === ',') {
            const index = parentNode.indexOf(selection.id);
            const newId = generateId();
            // const args = [...parentNode.arguments];
            // args.splice(index + 1, 0, newId);
            return {
                ...state,
                nodes: nodes.set(parent, [
                    ...parentNode.slice(0, index + 1),
                    newId,
                    ...parentNode.slice(index + 1),
                ]).set(newId, { type: 'Placeholder' }),
                parents: parents.set(newId, parent),
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
            if (/[\+\-\*\/]/.test(action.char) && pos === node.value.length) {
                const operatorId = generateId();
                const operator = {
                    type: 'Operator',
                    operator: action.char,
                };
                const placeholderId = generateId();
                const placeholder = {
                    type: 'Placeholder',
                };
                const binaryExpId = generateId();
                const binaryExp = {
                    type: 'BinaryExpression',
                    left: selection.id,
                    operator: operatorId,
                    right: placeholderId,
                };

                if (Array.isArray(parentNode)) {

                    return {
                        ...state,
                        nodes: nodes
                            .set(
                                parent,
                                parentNode.map(id => id === selection.id ? binaryExpId : id),
                            )
                            .set(operatorId, operator)
                            .set(placeholderId, placeholder)
                            .set(binaryExpId, binaryExp),
                        parents: parents
                            .set(binaryExpId, parent)
                            .set(selection.id, binaryExpId)
                            .set(operatorId, binaryExpId)
                            .set(placeholderId, binaryExpId),
                        selection: {
                            ...selection,
                            id: operatorId,
                            pos: 1,
                        },
                    };

                } else {
                    // TODO: refactor AST so expressions with operators are lists
                    const ordering = orderings[parentNode.type];
                    const prop = ordering.find(prop => parentNode[prop] === selection.id);
                    console.log(prop);

                    if (parentNode.type === 'BinaryExpression') {
                        if (prop === 'right') {
                            // parent becomes left

                        } else if (prop === 'left') {

                        }
                    }
                }

            } else if (/[0-9\.\-]/.test(action.char)) {
                if (action.char === '.' && node.value.includes('.')) {
                    return state;
                }
                if (action.char === '-' && (node.value.startsWith('-') || pos !== 0)) {
                    return state;
                }
                const left = node.value.substring(0, pos);
                const right = node.value.substring(pos);
                const value = left + action.char + right;
                pos += 1;

                return {
                    ...state,
                    nodes: nodes.set(selection.id, {...node, value}),
                    selection: {
                        ...selection,
                        pos: pos
                    },
                };
            }
        } else if (node.type === 'Identifier') {
            if (/[0-9a-zA-Z$_]/.test(action.char)) {
                if (/[0-9]/.test(action.char) && pos === 0) {
                    return state;
                }

                const left = node.name.substring(0, pos);
                const right = node.name.substring(pos);
                const name = left + action.char + right;
                pos += 1;

                return {
                    ...state,
                    nodes: nodes.set(selection.id, {...node, name}),
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
                    }),
                    selection: {
                        ...selection,
                        pos: 1
                    },
                };
            } else if (/[0-9\.\-]/.test(action.char)) {
                return {
                    ...state,
                    nodes: nodes.set(selection.id, {
                        type: 'NumberLiteral',
                        value: action.char,
                    }),
                    selection: {
                        ...selection,
                        pos: 1
                    },
                };
            } else if (/[a-zA-Z$_]/.test(action.char)) {
                return {
                    ...state,
                    nodes: nodes.set(selection.id, {
                        type: 'Identifier',
                        name: action.char,
                    }),
                    selection: {
                        ...selection,
                        pos: 1
                    },
                }
            }
            // TODO: handle unary operator and starting a negative number
        }
    }
    return state;
};
