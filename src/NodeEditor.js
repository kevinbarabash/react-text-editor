"use strict";

import React, { Component } from 'react'

import { renderAST } from './codegen';
import { findNode, findNodePath } from './node_utils';
import { Program } from './renderers';

import Selection from './selection';
import Cursor from './cursor';
import Gutter from './gutter';

import { leaves, orderings } from './ast_data';

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
    return node[ordering[i]];
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
            if (previousProp === null) {
                path.pop();
                return getPreviousNode(parent, path);
            }
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
            if (nextProp === null) {
                path.pop();
                return getNextNode(parent, path);
            }
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
    let lastProp = parent[ordering[ordering.length - 1]];
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

// TODO renamed to selectable nodes
let leafNodeTypes = [
    "NumberLiteral",
    "Identifier",
    "StringLiteral",
    "Placeholder",
    "CallExpression",
    "ThisExpression",
    "BlankStatement",
    "BinaryExpression",
    "AssignmentExpression",
    "ReturnStatement",
    "Operator",
    "Keyword"
];

class NodeEditor extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.state = {
            fontSize: 18,
            charWidth: 0,
            charHeight: 0,
            cursorPosition: {
                line: 2,
                column: 4
            },
            selectedNodes: [],
            cursorNode: null
        };
        // TODO: store scrollTop as part of state to maintain scrollTop position
    }

    handleClick(e) {
        e.preventDefault();

        let elem = React.findDOMNode(this);

        // TODO: measures this on componentDidMount or when the font size changes
        let { charWidth, charHeight } = this.state;
        let line = Math.floor((elem.scrollTop + e.pageY - elem.offsetTop - 1) / charHeight) + 1;

        let gutterWidth = 45;
        let column = Math.round((e.pageX - elem.offsetLeft - gutterWidth) / charWidth);
        
        let { cursorNode } = findNode(this.props.node, line, column);
        // TODO: check if it's a leaf node

        if (leafNodeTypes.includes(cursorNode.type)) {
            console.log("cursorNode = %o", cursorNode);
            //console.log(`line = ${line}, column = ${column}`);

            this.setState({
                cursorPosition: { line, column },
                cursorNode
            });

            if (["Placeholder", "Operator", "Keyword"].includes(cursorNode.type)) {
                this.setState({ selectedNodes: [cursorNode] });
            } else {
                this.setState({ selectedNodes: [] });
            }
        }
    }
    
    setCursorNode(cursorNode, locKey) {
        if (cursorNode) {
            let column = cursorNode.loc[locKey].column;
            let line = cursorNode.loc[locKey].line;
            this.setState({ cursorPosition: { column, line }, cursorNode });
            if (["Placeholder", "Operator", "Keyword"].includes(cursorNode.type)) {
                this.setState({ selectedNodes: [cursorNode] });
            } else {
                this.setState({ selectedNodes: [] });
            }
        }
    }

    handleKeyDown(e) {
        let node = this.state.cursorNode;
        let column = this.state.cursorPosition.column;
        let line = this.state.cursorPosition.line;

        let root = this.props.node;
        let path = findNodePath(root, line, column);
        
        if (["Identifier", "NumberLiteral", "StringLiteral"].includes(node.type)) {
            let relIdx = column - node.loc.start.column;
            let width = node.loc.end.column - node.loc.start.column;

            if (e.keyCode === 37) {
                if (relIdx > 0) {
                    column--;
                    this.setState({ cursorPosition: { column, line }});
                } else {
                    this.setCursorNode(getPreviousNode(node, path), "end");
                }
            } else if (e.keyCode === 39) {
                if (relIdx < width) {
                    column++;
                    this.setState({ cursorPosition: { column, line }});
                } else {
                    this.setCursorNode(getNextNode(node, path), "start");
                }
            }
        } else {
            if (e.keyCode === 37) {
                this.setCursorNode(getPreviousNode(node, path), "end");
            } else if (e.keyCode === 39) {
                this.setCursorNode(getNextNode(node, path), "start");
            }
        }

    }

    componentWillMount() {
        // TODO extract this so that we can this this component
        // add location information to the AST
        renderAST(this.props.node);

        var span = document.createElement('span');
        document.body.appendChild(span);
        span.innerHTML = '&nbsp;';
        span.style.fontSize = this.state.fontSize + 'px';
        span.style.fontFamily = 'monospace';
        var bbox = span.getBoundingClientRect();
        this.setState({ 
            charWidth: bbox.width,
            charHeight: bbox.height
        });
    }

    render() {
        let style = {
            fontFamily: 'monospace',
            fontSize: this.state.fontSize,
            whiteSpace: 'pre',
            border: "solid 1px black",
            height: 500,
            overflowY: "scroll",
            outline: 'none',
            position: 'relative'
        };

        let { charWidth, charHeight } = this.state;

        let selections = this.state.selectedNodes.map(node => {
            return <Selection charWidth={charWidth} charHeight={charHeight} node={node} />;
        });

        let { node } = this.props;

        // TODO use the delegate pattern to determine cursor visibility
        return <div style={style}
                    onClick={this.handleClick}
                    onKeyDown={this.handleKeyDown}
                    tabIndex={0}>
            {selections}
            <Cursor {...this.state.cursorPosition}
                visible={this.state.selectedNodes.length === 0}
                charWidth={charWidth}
                charHeight={charHeight}
            />
            <Gutter count={node.loc.end.line} />
            <Program {...node} />
        </div>;
    }
}

NodeEditor.propTypes = {
    lines: React.PropTypes.arrayOf(React.PropTypes.string)
};

export default NodeEditor;
