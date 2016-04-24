import { leaves, orderings } from '../data/ast_data';
import store from '../store';

console.log(orderings);
console.log(leaves);

// TODO: cursorIsOnLeftEdge, cursorIsOnRightEdget
// TODO: getPreviousNode, getNextNode

export const getValue = function(node) {
    if (node.type === 'NumberLiteral') {
        return node.value;
    } else if (node.type === 'StringLiteral') {
        return `"${node.value}"`;
    } else if (node.type === 'Identifier') {
        return node.name;
    }
};

let id = 0;

export const generateId = () => id++;


function getProp(node, i) {
    const state = store.getState();

    let ordering = orderings[node.type];
    if (i < 0) {
        i = ordering.length - 1;
    }
    return state.nodes.get(node[ordering[i]]);
}

function getLeftmostLeaf(id) {
    const state = store.getState();
    const node = state.nodes.get(id);

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
        if (state.nodes.get(firstNodeId)) {
            break;
        }
    }

    // TODO: handle case when firstNode is still -1
    return getLeftmostLeaf(firstNodeId);
}

export const getNextNode = (id) => {
    const state = store.getState();
    const node = state.nodes.get(id);

    let parent = state.nodes.get(node.parent);
    if (!parent) {
        throw "no next node";
    }

    const ordering = orderings[parent.type];

    for (let i = 0; i < ordering.length - 1; i++) {
        const current = parent[ordering[i]];
        const next = parent[ordering[i+1]];

        if (current === id) {
            // skip items that are null
            if (state.nodes.get(next) == null) continue;

            return getLeftmostLeaf(next);
        }

        if (Array.isArray(current)) {
            const index = current.findIndex(id => node === state.nodes.get(id));
            if (index < current.length - 1) {
                // get the next one
                return getLeftmostLeaf(current[index + 1]);
            }
        }
    }

    // debugger;

    const last = parent[ordering[ordering.length - 1]];
    if (Array.isArray(last)) {
        let index = last.findIndex(child => child === id);
        if (index < last.length - 1) {
            return getLeftmostLeaf(last[index + 1]);
        }
    }

    //debugger;

    // let ordering = orderings[parent.type];
    // for (let i = 0; i < ordering.length - 1; i++) {
    //     let currentProp = getProp(parent, i);
    //     let nextProp = getProp(parent, i + 1);
    //
    //     if (currentProp === node) {
    //         if (nextProp === null) continue;    // skip null props as these are optional
    //         return getLeftmostLeaf(nextProp);
    //     }
    //     if (Array.isArray(currentProp)) {
    //         let idx = currentProp.findIndex(child => child === node);
    //         if (idx < currentProp.length - 1) {
    //             return getLeftmostLeaf(currentProp[idx + 1]);
    //         } else if (idx === 0) {
    //             return getLeftmostLeaf(nextProp);
    //         }
    //     }
    // }
    // let lastProp = getProp(parent, -1);
    // if (Array.isArray(lastProp)) {
    //     let idx = lastProp.findIndex(child => child === node);
    //     if (idx < lastProp.length - 1) {
    //         return getLeftmostLeaf(lastProp[idx + 1]);
    //     }
    // }
    // // fallback
    // return getNextNode(parent);
};
