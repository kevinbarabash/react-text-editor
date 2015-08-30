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

// TODO: investigate using a function that returns an iterator and creating
// nodes for param lists, argument lists, etc.
function getPreviousNode(node, path) {
    let parent = path[path.length - 2];
    if (parent) {
        let ordering = orderings[parent.type];
        for (let i = ordering.length - 1; i > 0; i--) {
            let currentNode = parent[ordering[i]];
            let previousNode = parent[ordering[i - 1]];

            if (currentNode === node) {
                if (previousNode === null) {
                    path.pop();
                    return getPreviousNode(parent, path);
                }
                return getRightmostLeaf(previousNode);
            }
            if (Array.isArray(currentNode)) {
                let idx = currentNode.findIndex(child => child === node);
                if (idx > 0) {
                    return getRightmostLeaf(currentNode[idx - 1]);
                } else if (idx === 0) {
                    return getRightmostLeaf(previousNode);
                }
            }
        }
        let firstNode = parent[ordering[0]];
        if (Array.isArray(firstNode)) {
            let idx = firstNode.findIndex(child => child === node);
            let previousNode = firstNode[idx - 1];
            if (idx > 0 && previousNode) {
                return getRightmostLeaf(previousNode);
            } else {
                path.pop();
                return getPreviousNode(parent, path);
            }
        }
        if (firstNode === node) {
            path.pop();
            return getPreviousNode(parent, path);
        }
    }
}

function getNextNode(node, path) {
    let parent = path[path.length - 2];
    if (parent) {
        let ordering = orderings[parent.type];
        for (let i = 0; i < ordering.length - 1; i++) {
            let currentNode = parent[ordering[i]];
            let nextNode = parent[ordering[i + 1]];

            if (currentNode === node) {
                if (nextNode === null) {
                    path.pop();
                    return getNextNode(parent, path);
                }
                return getLeftmostLeaf(nextNode);
            }
            if (Array.isArray(currentNode)) {
                let idx = currentNode.findIndex(child => child === node);
                if (idx < currentNode.length - 1) {
                    return getLeftmostLeaf(currentNode[idx + 1]);
                } else if (idx === 0) {
                    return getLeftmostLeaf(nextNode);
                }
            }
        }
        let lastNode = parent[ordering[ordering.length - 1]];
        if (Array.isArray(lastNode)) {
            let idx = lastNode.findIndex(child => child === node);
            let nextNode = lastNode[idx + 1];

            if (idx < lastNode.length - 1 && nextNode) {
                return getLeftmostLeaf(nextNode);
            } else {
                path.pop();
                return getNextNode(parent, path);
            }
        }
        if (lastNode === node) {
            path.pop();
            return getNextNode(parent, path);
        }
    }
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

    handleKeyDown(e) {
        let node = this.state.cursorNode;
        let column = this.state.cursorPosition.column;
        let line = this.state.cursorPosition.line;
        
        if (["Identifier", "NumberLiteral", "StringLiteral"].includes(node.type)) {
            let relIdx = column - node.loc.start.column;
            let width = node.loc.end.column - node.loc.start.column;

            let root = this.props.node;
            let path = findNodePath(root, line, column);
            
            if (e.keyCode === 37) {
                if (relIdx > 0) {
                    column--;
                    this.setState({ cursorPosition: { column, line }});
                } else {
                    let previousNode = getPreviousNode(node, path);

                    if (previousNode) {
                        let cursorNode = previousNode;
                        column = cursorNode.loc.end.column;
                        line = cursorNode.loc.end.line;
                        this.setState({ cursorPosition: { column, line }, cursorNode });
                        if (["Placeholder", "Operator", "Keyword"].includes(cursorNode.type)) {
                            this.setState({ selectedNodes: [cursorNode] });
                        } else {
                            this.setState({ selectedNodes: [] });
                        }
                    }
                }
            } else if (e.keyCode === 39) {
                if (relIdx < width) {
                    column++;
                    this.setState({ cursorPosition: { column, line }});
                } else {
                    let nextNode = getNextNode(node, path);

                    if (nextNode) {
                        let cursorNode = nextNode;
                        column = cursorNode.loc.start.column;
                        line = cursorNode.loc.start.line;
                        this.setState({ cursorPosition: { column, line }, cursorNode });
                        if (["Placeholder", "Operator", "Keyword"].includes(cursorNode.type)) {
                            this.setState({ selectedNodes: [cursorNode] });
                        } else {
                            this.setState({ selectedNodes: [] });
                        }
                    }
                }
            }
        } else {
            let root = this.props.node;
            let path = findNodePath(root, line, column);
            
            if (e.keyCode === 37) {
                let previousNode = getPreviousNode(node, path);
                
                if (previousNode) {
                    let cursorNode = previousNode;
                    column = cursorNode.loc.end.column;
                    line = cursorNode.loc.end.line;
                    this.setState({ cursorPosition: { column, line }, cursorNode });
                    if (["Placeholder", "Operator", "Keyword"].includes(cursorNode.type)) {
                        this.setState({ selectedNodes: [cursorNode] });
                    } else {
                        this.setState({ selectedNodes: [] });
                    }
                }
            } else if (e.keyCode === 39) {
                let nextNode = getNextNode(node, path);

                if (nextNode) {
                    let cursorNode = nextNode;
                    column = cursorNode.loc.start.column;
                    line = cursorNode.loc.start.line;
                    this.setState({ cursorPosition: { column, line }, cursorNode });
                    if (["Placeholder", "Operator", "Keyword"].includes(cursorNode.type)) {
                        this.setState({ selectedNodes: [cursorNode] });
                    } else {
                        this.setState({ selectedNodes: [] });
                    }
                }
            }
        }

    }

    componentWillMount() {
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
