"use strict";

import { leaves, orderings } from './ast_data';
import { findNode, findNodePath } from './node_utils';

import { renderAST } from './codegen';

// TODO: handle empty arguments, elements, etc.

function getRightmostLeaf(node) {
    if (Array.isArray(node)) {
        return getRightmostLeaf(node[node.length - 1]);
    }
    if (leaves.includes(node.type)) {
        return node;
    }
    let ordering = orderings[node.type];
    let lastNode = null;
    for (let i = ordering.length - 1; i > -1; i--) {
        lastNode = node[ordering[i]];
        if (lastNode) {
            break;
        }
    }
    // TODO: handle case when lastNode is still null
    return getRightmostLeaf(lastNode);
}

function getLeftmostLeaf(node) {
    if (Array.isArray(node)) {
        return getLeftmostLeaf(node[0]);
    }
    if (leaves.includes(node.type)) {
        return node;
    }
    let ordering = orderings[node.type];
    let firstNode = null;
    for (let i = 0; i < ordering.length; i++) {
        firstNode = node[ordering[i]];
        if (firstNode) {
            break;
        }
    }
    // TODO: handle case when firstNode is still null
    return getLeftmostLeaf(firstNode);
}

// get ordered prop
function getProp(node, i) {
    let ordering = orderings[node.type];
    if (i < 0) {
        i = ordering.length - 1;
    }
    return node[ordering[i]];
}

function getNextNode(node, path) {
    let parent = path[path.length - 2];
    if (!parent) {
        throw "no next node";
    }
    let ordering = orderings[parent.type];
    for (let i = 0; i < ordering.length - 1; i++) {
        let currentProp = getProp(parent, i);
        let nextProp = getProp(parent, i + 1);

        if (currentProp === node) {
            if (nextProp === null) continue;    // skip null props as these are optional
            return getLeftmostLeaf(nextProp);
        }
        if (Array.isArray(currentProp)) {
            let idx = currentProp.findIndex(child => child === node);
            if (idx < currentProp.length - 1) {
                return getLeftmostLeaf(currentProp[idx + 1]);
            } else if (idx === 0) {
                return getLeftmostLeaf(nextProp);
            }
        }
    }
    let lastProp = getProp(parent, -1);
    if (Array.isArray(lastProp)) {
        let idx = lastProp.findIndex(child => child === node);
        if (idx < lastProp.length - 1) {
            return getLeftmostLeaf(lastProp[idx + 1]);
        }
    }
    // fallback
    path.pop();
    return getNextNode(parent, path);
}

function getPreviousNode(node, path) {
    let parent = path[path.length - 2];
    if (!parent) {
        throw "no previous node";
    }
    let ordering = orderings[parent.type];
    for (let i = ordering.length - 1; i > 0; i--) {
        let currentProp = getProp(parent, i);
        let previousProp = getProp(parent, i - 1);

        if (currentProp === node) {
            if (previousProp === null) continue;    // skip null props as these are optional
            return getRightmostLeaf(previousProp);
        }
        if (Array.isArray(currentProp)) {
            let idx = currentProp.findIndex(child => child === node);
            if (idx > 0) {
                return getRightmostLeaf(currentProp[idx - 1]);
            } else if (idx === 0) {
                return getRightmostLeaf(previousProp);
            }
        }
    }
    let firstProp = getProp(parent, 0);
    if (Array.isArray(firstProp)) {
        let idx = firstProp.findIndex(child => child === node);
        if (idx > 0) {
            return getRightmostLeaf(firstProp[idx - 1]);
        }
    }
    // fallback
    path.pop();
    return getPreviousNode(parent, path);
}

class HeadlessEditor {
    constructor(root) {
        this.root = root;
        this.cursorNode = null;
        this.cursorPosition = {
            line: 2,
            column: 4
        };
        this.selectedNodes = [];
    }

    update(cursorNode, locKey) {
        if (cursorNode) {
            let column = cursorNode.loc[locKey].column;
            let line = cursorNode.loc[locKey].line;
            this.cursorPosition = { line, column };
            this.cursorNode = cursorNode;
            if (["Placeholder", "Operator", "Keyword"].includes(cursorNode.type)) {
                this.selectedNodes = [cursorNode];
            } else {
                this.selectedNodes = [];
            }
        }
    }
    
    getRelIdx() {
        let node = this.cursorNode;
        let { line, column } = this.cursorPosition;
        
        return column - node.loc.start.column;
    }

    forward(callback) {
        let node = this.cursorNode;
        let { line, column } = this.cursorPosition;
        let path = findNodePath(this.root, line, column);

        if (["Identifier", "NumberLiteral", "StringLiteral"].includes(node.type)) {
            let relIdx = this.getRelIdx();
            let width = node.loc.end.column - node.loc.start.column;
       
            if (relIdx < width) {
                this.cursorPosition.column = column + 1;
            } else {
                this.update(getNextNode(node, path), "start");
            }
        } else {
            this.update(getNextNode(node, path), "start");
        }
        
        if (callback) {
            callback(this.cursorNode, this.cursorPosition, this.selectedNodes);
        }
    }
    
    back(callback) {
        let node = this.cursorNode;
        let { line, column } = this.cursorPosition;
        let path = findNodePath(this.root, line, column);

        if (["Identifier", "NumberLiteral", "StringLiteral"].includes(node.type)) {
            let relIdx = this.getRelIdx();

            if (relIdx > 0) {
                this.cursorPosition.column = column - 1;
            } else {
                this.update(getPreviousNode(node, path), "end");
            } 
        } else {
            this.update(getPreviousNode(node, path), "end");
        }
        
        if (callback) {
            callback(this.cursorNode, this.cursorPosition, this.selectedNodes);
        }
    }
    
    backspace(callback) {
        
    }
    
    insert(char, callback) {
        let node = this.cursorNode;
        let relIdx = this.getRelIdx();
        
        console.log(node.component);
        
        if (node.type === "NumberLiteral") {
            if (/[0-9\.]/.test(char)) {
                let value = node.value;
                if (char === "." && /[\.]/.test(value)) {
                    return;
                }
                value = value.substring(0, relIdx) + char + value.substring(relIdx);
                node.value = value;
                node.component.forceUpdate();
                this.cursorPosition.column += 1;
                renderAST(this.root);
            } else {
                return;
            }
        } else if (node.type === "StringLiteral") {
            let value = node.value;
            value = value.substring(0, relIdx - 1) + char + value.substring(relIdx - 1);
            node.value = value;
            node.component.forceUpdate();
            this.cursorPosition.column += 1;
            renderAST(this.root);

        } else if (node.type === "Identifier") {
            if (/[a-zA-Z0-9]/.test(char)) {
                let name = node.name;
                name = name.substring(0, relIdx) + char + name.substring(relIdx);
                node.name = name;
                node.component.forceUpdate();
                this.cursorPosition.column += 1;
                renderAST(this.root);
            } else {
                return;
            }
        } else if (node.type === "Placeholder") {
            // TODO: determine if there are any restrictions on this placeholder

            // TODO: actually create a new node and replace the placeholder
            if (/[0-9\.]/.test(char)) {
                node.type = "NumberLiteral";
                node.value = char;
            } else if (/[a-zA-Z]/.test(char)) {
                node.type = "Identifier";
                node.name = char;
            } else if (char === '"') {
                node.type = "StringLiteral";
                node.value = "";
            }
        }
        
        if (callback) {
            callback(this.cursorNode, this.cursorPosition, this.selectedNodes);
        }
    }
}

export default HeadlessEditor;
