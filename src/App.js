import React, { Component } from 'react';
import prog from './prog';
import { renderAST } from './codegen';
import { findNode } from './node_utils';
import { Program } from './renderers';
import Selection from './selection';
import Cursor from './cursor';

class Gutter extends Component {
    render() {
        let count = this.props.count;
        let style = {
            width: 40,
            textAlign: 'right',
            backgroundColor: '#CCC',
            paddingRight: 3
        };
        let lines = [];
        for (let i = 0; i < count; i++) {
            lines.push(<div>{i+1}</div>);
        }
        
        return <div style={style}>
            {lines}
        </div>;
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
    "ReturnStatement"
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
        let line = Math.floor((elem.scrollTop + e.pageY - elem.offsetTop - 1) / lineHeight);
        
        let charWidth = 9.60156;
        let gutterWidth = 45;
        let column = Math.round((e.pageX - elem.offsetLeft - gutterWidth) / charWidth);

        let { cursorNode } = findNode(prog, line + 1, column);
        // TODO: check if it's a leaf node
        
        if (leafNodeTypes.includes(cursorNode.type)) {
            console.log("cursorNode = %o", cursorNode);
            //console.log(`line = ${line}, column = ${column}`);

            this.setState({ 
                cursorPosition: { line, column },
                cursorNode
            });

            if (["Placeholder", "BinaryExpression", "ReturnStatement"].includes(cursorNode.type)) {
                this.setState({ selectedNodes: [cursorNode] });
            } else {
                this.setState({ selectedNodes: [] });
            }
        }
    }

    handleKeyDown(e) {
        let node = this.state.cursorNode;
        
        if (["Identifier", "Literal", "StringLiteral"].includes(node.type)) {
            let column = this.state.cursorPosition.column;
            let relIdx = column - node.loc.start.column;
            let width = node.loc.end.column - node.loc.start.column;

            if (e.keyCode === 37) {
                if (relIdx > 0) {
                    column--;
                    this.setState({ cursorPosition: { column }});
                }
                console.log("left");
            } else if (e.keyCode === 39) {
                if (relIdx < width) {
                    column++;
                    this.setState({ cursorPosition: { column }});
                }
                console.log("right");
            }
        }
       
    }

    componentWillMount() {
        // add location information to the AST
        renderAST(prog);
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


class LineEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // TODO: update renderAST to return an array instead of a strings
            // TODO: each line should be an array of objects with 
            code: renderAST(props.node)
        };
    }

    handleKeyPress(e) {
        console.log(e.keyCode);
        e.preventDefault();
    }
    
    handleKeyDown(e) {
        if ([8, 37, 38, 39, 40].includes(e.keyCode)) {
            e.preventDefault();
        }
        console.log(e.keyCode);
        
    }

    render() {
        let lines = this.state.code.split("\n").map(line => <div>{line || "\u200b"}</div>);
        let style = {
            fontFamily: "monospace",
            fontSize: 16,
            whiteSpace: "pre",
            border: "solid 1px black",
            height: 300,
            overflowY: "scroll"
        };
        
        return <div style={style} 
                    onKeyPress={this.handleKeyPress}
                    onKeyDown={this.handleKeyDown}>
            {lines}
        </div>;
    }
}

LineEditor.propTypes = {
    lines: React.PropTypes.arrayOf(React.PropTypes.string)
};

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    
    render() {
        return <div>
            <h1>Program</h1>
            <NodeEditor node={prog} />
        </div>;
    }
}
