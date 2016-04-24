import { getValue, getNextNode, getPrevNode } from './node_tools';

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
                    id = getPrevNode(selection.id);
                    if (id === -1) return state;
                    const value = getValue(nodes.get(id));
                    pos = value != null ? value.length : undefined;
                } else {
                    pos = pos - 1;
                }

                return {
                    ...state,
                    selection: {id, pos},
                };
            } else if (['Placeholder', 'Keyword'].includes(node.type)) {
                id = getPrevNode(selection.id);
                if (id === -1) return state;
                const value = getValue(nodes.get(id));

                return {
                    ...state,
                    selection: {
                        id,
                        pos: value != null ? value.length : undefined,
                    }
                };
            }

            return state;
        case 'MOVE_RIGHT':
            node = state.nodes.get(selection.id);
            id = selection.id;

            if (selection && selection.pos != null) {
                let pos = selection.pos;
                const value = getValue(node);

                if (pos === value.length) {
                    id = getNextNode(selection.id);
                    if (id === -1) return state;
                    const value = getValue(nodes.get(id));
                    pos = value != null ? 0 : undefined;
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
            } else if (['Placeholder', 'Keyword'].includes(node.type)) {
                id = getNextNode(selection.id);
                if (id === -1) return state;
                const value = getValue(nodes.get(id));

                return {
                    ...state,
                    selection: {
                        id,
                        pos: value != null ? 0 : undefined,
                    }
                };
            }
            return state;
        default:
            return state;
    }
};
