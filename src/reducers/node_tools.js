import { leaves, orderings } from '../data/ast_data';
import store from '../store';

// TODO: cursorIsOnLeftEdge, cursorIsOnRightEdget
// TODO: getPreviousNode, getNextNode

const getValue = function(node) {
    if (node.type === 'NumberLiteral') {
        return node.value;
    } else if (node.type === 'StringLiteral') {
        return `"${node.value}"`;
    } else if (node.type === 'Identifier') {
        return node.name;
    } else if (node.type === 'Operator') {
        return node.operator;
    } else if (node.type === 'BlankStatement') {
        return '';
    }
};

let id = 0;

const generateId = () => id++;

const getLeftmostLeaf = (id) => {
    const { nodes } = store.getState();

    const node = nodes.get(id);

    if (Array.isArray(node)) {
        return getLeftmostLeaf(node[0]);
    }

    if (leaves.includes(node.type)) {
        return id;
    }

    let ordering = orderings[node.type];
    let firstNodeId = -1;

    for (let i = 0; i < ordering.length; i++) {
        firstNodeId = node[ordering[i]];
        const firstNode = nodes.get(firstNodeId);
        if (firstNode != null) {
            if (Array.isArray(firstNode)) {
                if (firstNode.length > 0) {
                    break;
                }
            } else {
                break;
            }
        }
    }

    return getLeftmostLeaf(firstNodeId);
};

const getRightmostLeaf = (id) => {
    const { nodes } = store.getState();

    const node = nodes.get(id);

    if (Array.isArray(node)) {
        return getRightmostLeaf(node[node.length - 1]);
    }

    if (leaves.includes(node.type)) {
        return id;
    }

    let ordering = orderings[node.type];
    let firstNodeId = -1;

    for (let i = ordering.length - 1; i > -1; i--) {
        firstNodeId = node[ordering[i]];
        const firstNode = nodes.get(firstNodeId);
        if (firstNode != null) {
            if (Array.isArray(firstNode)) {
                if (firstNode.length > 0) {
                    break;
                }
            } else {
                break;
            }
        }
    }

    return getRightmostLeaf(firstNodeId);
};


const getNextNode = function(id) {
    const { nodes, parents } = store.getState();

    const parent = nodes.get(parents.get(id));

    if (Array.isArray(parent)) {
        const index = parent.indexOf(id);
        if (index < parent.length - 1) {
            return getLeftmostLeaf(parent[index + 1]);
        }
    } else {
        const ordering = orderings[parent.type];
        let index = ordering.findIndex(prop => parent[prop] === id);
        for ( ; index < ordering.length - 1; index += 1) {
            const next = parent[ordering[index + 1]];
            const nextNode = nodes.get(next);

            if (next == null) continue;
            if (Array.isArray(nextNode) && nextNode.length === 0) continue;

            return getLeftmostLeaf(next);
        }
    }

    const parentId = parents.get(id);
    return parentId !== 0 ? getNextNode(parentId) : -1;
};

const getPrevNode = function(id) {
    const { nodes, parents } = store.getState();

    const parent = nodes.get(parents.get(id));

    if (Array.isArray(parent)) {
        const index = parent.indexOf(id);
        if (index > 0) {
            return getRightmostLeaf(parent[index - 1]);
        }
    } else {
        const ordering = orderings[parent.type];
        let index = ordering.findIndex(prop => parent[prop] === id);
        for ( ; index > 0; index -= 1) {
            const prev = parent[ordering[index - 1]];
            const prevNode = nodes.get(prev);

            if (prev == null) continue;
            if (Array.isArray(prevNode) && prevNode.length === 0) continue;

            return getRightmostLeaf(prev);
        }
    }

    const parentId = parents.get(id);
    return parentId !== 0 ? getPrevNode(parentId) : -1;
};

export {
    getValue,
    generateId,
    getNextNode,
    getPrevNode,
};
