"use strict";

import React, { Component } from 'react'

import { renderAST } from './codegen';
import { findNode, findNodePath } from './node_utils';
import { Program } from './renderers';

import Selection from './selection';
import Cursor from './cursor';
import Gutter from './gutter';

import { leaves, orderings } from './ast_data';

import HeadlessEditor from './HeadlessEditor';

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
        this.handleKeyPress = this.handleKeyPress.bind(this);
        
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
        
        this.headlessEditor = new HeadlessEditor(props.node);

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

            this.headlessEditor.cursorNode = cursorNode;
            this.headlessEditor.cursorPosition = { line, column };
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
        if (e.keyCode === 37) {
            // TODO group cursorNode and cursorPosition together into a Cursor object
            // which is separate from a CursorView
            this.headlessEditor.back((cursorNode, cursorPosition, selectedNodes) => {
                this.setState({ cursorNode, cursorPosition, selectedNodes });
            });
        } else if (e.keyCode === 39) {
            this.headlessEditor.forward((cursorNode, cursorPosition, selectedNodes) => {
                this.setState({ cursorNode, cursorPosition, selectedNodes });
            });
        } else if (e.keyCode === 8) {
            e.preventDefault();
        }
    }
    
    handleKeyPress(e) {
        let char = String.fromCharCode(e.charCode);
        console.log(char);
        this.headlessEditor.insert(char, (cursorNode, cursorPosition, selectedNodes) => {
            this.setState({ cursorNode, cursorPosition, selectedNodes }); 
        });
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
                    onKeyPress={this.handleKeyPress}
                    tabIndex={0}>
            {selections}
            <Cursor {...this.state.cursorPosition}
                visible={this.state.selectedNodes.length === 0}
                charWidth={charWidth}
                charHeight={charHeight}
            />
            <Gutter count={node.loc.end.line} />
            <Program node={node} />
        </div>;
    }
}

NodeEditor.propTypes = {
    lines: React.PropTypes.arrayOf(React.PropTypes.string)
};

export default NodeEditor;
