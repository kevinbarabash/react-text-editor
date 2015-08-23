import React, { Component } from 'react';
import prog from './prog';
import { renderAST } from './codegen';
import { findNode } from './node_utils';

let maybeRender;

class Identifier extends Component {
    render() {
        return <span>{this.props.node.name}</span>;
    }
}

class VariableDeclarator extends Component {
    render() {
        let { id, init } = this.props.node;
        if (init) {
            return <span>{maybeRender(id)} = {maybeRender(init)}</span>;
        } else {
            return <span>{maybeRender(id)}</span>;
        }
    }
}

class LineComment extends Component {
    render() {
        let style = {
            color: "rgb(76, 136, 107)"
        };
        return <div style={style}>// {this.props.node.content}</div>;
    };
}

class BlockComment extends Component {
    render() {
        let style = {
            color: "rgb(76, 136, 107)"
        };
        let lines = this.props.node.content.split("\n").map(line => {
            return <div>{" * " + line}</div>;
        });
        
        return <div style={style}>
            <div>{"/*"}</div>
            {lines}
            <div>{" */"}</div>
        </div>;
    }
}

class ClassDeclaration extends Component {
    render() {
        let id = maybeRender(this.props.node.id);
        let body = maybeRender(this.props.node.body);
        let open = " {";
        let close = "}";
        
        return <div>
            <div>
                <span style={{ color: "#00F" }}>class</span>
                {" "}
                <span>{id}</span>{open}
            </div>
            <div>{body}</div>
            {close}
        </div>;
    }
}

class ClassBody extends Component {
    render() {
        let defs = this.props.node.body.map(def => {
            let result = maybeRender(def);
            result.props.indent = "    ";
            return result;
        });
        return <div>{defs}</div>
    }
}

class MethodDefinition extends Component {
    render() {
        let key = maybeRender(this.props.node.key);
        let value = maybeRender(this.props.node.value);
        value.props.method = true;
        value.props.indent = this.props.indent;
        return <div>{this.props.indent}{key}{value}</div>;
    }
}

class FunctionExpression extends Component {
    render() {
        let open = "{";
        let close = this.props.indent + "}";
        let body = maybeRender(this.props.node.body);
        body.props.indent = this.props.indent + "    ";

        let params = [];
        this.props.node.params.forEach((param, index) => {
            if (index > 0) {
                params.push(", ");
            }
            params.push(maybeRender(param));
        });
        
        if (this.props.method) {
            return <span>({params}) {open}<div>{body}</div>{close}</span>;
        }
    }
}

class Placeholder extends Component {
    render() {
        return <span>?</span>;
    }
}

class ReturnStatement extends Component {
    render() {
        let expression = maybeRender(this.props.node.argument);
        let style = {
            color: "#00F"
        };
        return <div>{this.props.indent}<span style={style}>return</span> {expression};</div>;
    }
}

class VariableDeclaration extends Component {
    render() {
        let decl = maybeRender(this.props.node.declarations[0]);
        let kind = this.props.node.kind;
        return <span>{kind} {decl}</span>;
    }
}

class ExpressionStatement extends Component {
    render() {
        let expression = maybeRender(this.props.node.expression);
        return <div>{this.props.indent}{expression};</div>;
    }
}

class BlockStatement extends Component {
    render() {
        let children = this.props.node.body.map(child => {
            let result = maybeRender(child);
            result.props.indent = this.props.indent;
            return result;
        });
        return <div style={this.props.style}>{children}</div>;
    }
}

class BlankStatement extends Component {
    render() {
        return <div>{"\u200b"}</div>;
    }
}

class AssignmentExpression extends Component {
    render() {
        let left = maybeRender(this.props.node.left);
        let right = maybeRender(this.props.node.right);
        let operator = this.props.node.operator;
        return <span>{left} {operator} {right}</span>;
    }
}

class CallExpression extends Component {
    render() {
        let callee = maybeRender(this.props.node.callee);
        let args = [];
        this.props.node.arguments.forEach((arg, index) => {
            if (index > 0) {
                args.push(", ");
            }
            args.push(maybeRender(arg));
        });
        return <span>{callee}({args})</span>;
    }
}

class ForOfStatement extends Component {
    render() {
        let left = maybeRender(this.props.node.left);
        let right = maybeRender(this.props.node.right);
        let block = maybeRender(this.props.node.body);
        block.props.indent = "    ";
        let open = "{";
        let close = "}";
        
        return <div>
            <div><span style={{color:"#00F"}}>for</span> ({left} of {right}) {open}</div>
                {block}
            <div>{close}</div>
        </div>;
    }
}

class BinaryExpression extends Component {
    render() {
        let left = maybeRender(this.props.node.left);
        let right = maybeRender(this.props.node.right);
        let operator = this.props.node.operator;
        return <span>{left} {operator} {right}</span>;
    }
}

class ArrayExpression extends Component {
    render() {
        let elements = [];
        this.props.node.elements.forEach((element, index) => {
            if (index > 0) {
                elements.push(", ");
            }
            elements.push(maybeRender(element));
        });
        return <span>[{elements}]</span>;
    }
}

class Literal extends Component {
    render() {
        return <span style={{color:"#00C"}}>{this.props.node.raw}</span>;
    }
}

let components = {
    ForOfStatement,
    VariableDeclaration,
    VariableDeclarator,
    Identifier,
    ArrayExpression,
    Literal,
    BlockStatement,
    ExpressionStatement,
    BlankStatement,
    AssignmentExpression,
    BinaryExpression,
    CallExpression,
    LineComment,
    BlockComment,
    ClassDeclaration,
    ClassBody,
    MethodDefinition,
    FunctionExpression,
    ReturnStatement,
    Placeholder
};

maybeRender = function(node) {
    if (components[node.type]) {
        return React.createElement(components[node.type], { node });
    } else {
        return <span>{node.type}</span>;
    }
};

class Program extends Component {
    render() {
        let style = {
            position: 'absolute',
            top: 0,
            left: 0
        };
        
        let start = Date.now();
        let children = this.props.body.map(child => maybeRender(child));
        let result = <div style={style}>{children}</div>;
        let elapsed = Date.now() - start;
        console.log(`elapsed = ${elapsed}ms`);
        
        return result;
    }
}

class Cursor extends Component {
    constructor() {
        super();
        this.state = {
            opacity: 1
        };
    }
    
    componentDidMount() {
        this.interval = setInterval(() => {
            if (this.state.opacity === 1) {
                this.setState({ opacity: 0 });
            } else {
                this.setState({ opacity: 1 });
            }
        }, 500);
    }
    
    componentWillUnmount() {
        clearInterval(this.interval);
    }
    
    // TODO when props change reset the interval and opacity
    
    render() {
        let cursorWidth = 2;
        let style = {
            position: 'absolute',
            left: this.props.column * 9.60156 - 1,
            top: this.props.line * 18,
            width: cursorWidth,
            height: 18,
            background: 'black',
            opacity: this.props.visible ? this.state.opacity : 0
        };
        
        return <div style={style}></div>;
    }
}

Cursor.defaultProps = {
    visible: true
};

class Selection extends Component {
    render() {
        let charWidth = 9.60156;
        let lineHeight = 18;

        let loc = this.props.node.loc;
        
        let style = {
            position: 'absolute',
            left: loc.start.column * charWidth,
            top: (loc.start.line - 1) * lineHeight,
            width: charWidth * (loc.end.column - loc.start.column),
            height: lineHeight,
            background: 'rgb(181, 213, 255)'
        };
        
        return <div style={style}></div>;
    }
}

class NodeEditor extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            cursorPosition: {
                line: 2,
                column: 4
            },
            selectedNodes: []
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
        let column = Math.round((e.pageX - elem.offsetLeft) / charWidth);

        console.log(`line = ${line}, column = ${column}`);
        
        this.setState({ cursorPosition: { line, column } });
        
        var { cursorNode } = findNode(prog, line + 1, column);
        console.log("cursorNode = %o", cursorNode);
        
        if (cursorNode.type === "Placeholder") {
            this.setState({ selectedNodes: [cursorNode] });
        } else {
            this.setState({ selectedNodes: [] });
        }
    }
    
    handleMouseDown(e) {
        e.preventDefault();
    }
    
    componentDidMount() {
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
        
        return <div style={style} 
                    contentEditable={true} 
                    onClick={this.handleClick}
                    onMouseDown={this.handleMouseDown}>
            {selections}
            <Cursor {...this.state.cursorPosition} 
                    visible={this.state.selectedNodes.length === 0} />
            <Program {...this.props.node} />
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
                    contentEditable={true}
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
