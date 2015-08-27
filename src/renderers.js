import React, { Component } from 'react';

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
        let { node } = this.props;
        let id = maybeRender(node.id);
        let body = maybeRender(node.body);
        let open = " {";
        let close = "}";

        // TODO handle indentation of nested classes
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
        let { node } = this.props;
        let key = maybeRender(node.key);
        let value = maybeRender(node.value);
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

        let { node } = this.props;
        let params = [];
        node.params.forEach((param, index) => {
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
        let { node } = this.props;
        let expression = maybeRender(node.argument);
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
        let { node } = this.props;
        let expression = maybeRender(node.expression);
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
        let { node } = this.props;
        return <div>{"\u200b"}</div>;
    }
}

class AssignmentExpression extends Component {
    render() {
        let left = maybeRender(this.props.node.left);
        let right = maybeRender(this.props.node.right);
        let operator = maybeRender(this.props.node.operator);
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
        let { node } = this.props;
        let left = maybeRender(node.left);
        let right = maybeRender(node.right);
        let block = maybeRender(node.body);
        block.props.indent = "    ";
        let open = "{";
        let close = "}";

        // TODO handle indentation
        return <div>
            <div>
                <span style={{color:"#00F"}}>for</span> ({left} of {right}) {open}
            </div>
            {block}
            <div>
                {close}
            </div>
        </div>;
    }
}

class BinaryExpression extends Component {
    render() {
        let left = maybeRender(this.props.node.left);
        let right = maybeRender(this.props.node.right);
        let operator = maybeRender(this.props.node.operator);
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

class StringLiteral extends Component {
    render() {
        return <span style={{color:"#900"}}>"{this.props.node.value}"</span>;
    }
}

class Operator extends Component {
    render() {
        return <span>{this.props.node.operator}</span>;
    }
}

class Program extends Component {
    render() {
        let style = {
            position: 'absolute',
            top: 0,
            left: 45
        };

        let start = Date.now();
        let children = this.props.body.map(child => maybeRender(child));
        let result = <div style={style}>{children}</div>;
        let elapsed = Date.now() - start;
        console.log(`elapsed = ${elapsed}ms`);

        return result;
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
    Placeholder,
    StringLiteral,
    Operator
};

maybeRender = function(node) {
    if (components[node.type]) {
        return React.createElement(components[node.type], { node });
    } else {
        return <span>{node.type}</span>;
    }
};

export { Program };
