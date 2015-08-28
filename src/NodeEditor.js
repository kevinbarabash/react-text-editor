import React, { Component } from 'react'

import { renderAST } from './codegen';
import { findNode, findNodePath } from './node_utils';
import { Program } from './renderers';

import Selection from './selection';
import Cursor from './cursor';
import Gutter from './gutter';


// TODO: have arrays that list the names of all child props for each node
// TODO: ... in order

function getPreviousNode(node, path) {
    let parent = path[path.length - 2];
    if (parent) {
        if (parent.type === "BinaryExpression") {
            if (parent.right === node) {
                return parent.operator;
            } else if (parent.operator === node) {
                return parent.left;
            } else if (parent.left === node) {
                return getPreviousNode(parent, path);
            }
        }
    }
}

function getNextNode(node, path) {
    let parent = path[path.length - 2];
    if (parent) {
        if (parent.type === "BinaryExpression") {
            if (parent.left === node) {
                return parent.operator;
            } else if (parent.operator === node) {
                return parent.right;
            } else if (parent.right === node) {
                return getNextNode(parent, path);
            }
        }
    }
}


let leafNodeTypes = [
    "Literal",
    "Identifier",
    "StringLiteral",
    "Placeholder",
    "CallExpression",
    "ThisExpression",
    "BlankStatement",
    "BinaryExpression",
    "AssignmentExpression",
    "ReturnStatement",
    "Operator"
];

class NodeEditor extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.state = {
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
        let lineHeight = 18;
        let line = Math.floor((elem.scrollTop + e.pageY - elem.offsetTop - 1) / lineHeight) + 1;

        let charWidth = 9.60156;
        let gutterWidth = 45;
        let column = Math.round((e.pageX - elem.offsetLeft - gutterWidth) / charWidth);
        
        let { cursorNode } = findNode(this.props.node, line, column);
        // TODO: check if it's a leaf node

        if (leafNodeTypes.includes(cursorNode.type)) {
            console.log("cursorNode = %o", cursorNode);
            console.log(`line = ${line}, column = ${column}`);

            this.setState({
                cursorPosition: { line, column },
                cursorNode
            });

            if (["Placeholder", "Operator", "ReturnStatement"].includes(cursorNode.type)) {
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
        
        if (["Identifier", "Literal", "StringLiteral"].includes(node.type)) {
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
                        if (["Placeholder", "Operator", "ReturnStatement"].includes(cursorNode.type)) {
                            this.setState({ selectedNodes: [cursorNode] });
                        } else {
                            this.setState({ selectedNodes: [] });
                        }
                    }
                }
                console.log("left");
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
                        if (["Placeholder", "Operator", "ReturnStatement"].includes(cursorNode.type)) {
                            this.setState({ selectedNodes: [cursorNode] });
                        } else {
                            this.setState({ selectedNodes: [] });
                        }
                    }
                }
                console.log("right");
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
                    if (["Placeholder", "Operator", "ReturnStatement"].includes(cursorNode.type)) {
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
                    if (["Placeholder", "Operator", "ReturnStatement"].includes(cursorNode.type)) {
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
    }

    render() {
        let style = {
            fontFamily: 'monospace',
            fontSize: 16,
            whiteSpace: 'pre',
            border: "solid 1px black",
            height: 500,
            overflowY: "scroll",
            outline: 'none',
            position: 'relative'
        };

        let selections = this.state.selectedNodes.map(node => {
            return <Selection node={node} />;
        });

        let { node } = this.props;

        // TODO use the delegate pattern to determine cursor visibility
        return <div style={style}
                    onClick={this.handleClick}
                    onKeyDown={this.handleKeyDown}
                    tabIndex={0}>
            {selections}
            <Cursor {...this.state.cursorPosition}
                visible={this.state.selectedNodes.length === 0} />
            <Gutter count={node.loc.end.line} />
            <Program {...node} />
        </div>;
    }
}

NodeEditor.propTypes = {
    lines: React.PropTypes.arrayOf(React.PropTypes.string)
};

export default NodeEditor;
