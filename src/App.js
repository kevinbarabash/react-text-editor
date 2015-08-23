import React, { Component } from 'react';
import prog from './prog';
import { renderAST } from './codegen'; 

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
            color: "rgb(76, 136, 107)",
            whiteSpace: "pre"
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
        let start = Date.now();
        let children = this.props.body.map(child => maybeRender(child));
        let style = {
            fontFamily: 'monospace',
            fontSize: 16,
            whiteSpace: 'pre'
        };
        
        let result = <div 
            style={style}
            contentEditable={true}>{children}</div>;
        
        let elapsed = Date.now() - start;
        console.log(`elapsed = ${elapsed}ms`);
        
        return result;
    }
}

class NodeEditor extends Component {
    render() {
        return <Program {...this.props.node} />;
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
        
        return <div 
            style={style} 
            contentEditable={true}
            onKeyPress={this.handleKeyPress}
            onKeyDown={this.handleKeyDown}
            >{lines}</div>;
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
