import React, { Component } from 'react';

let maybeRender;

class ASTNode extends Component {
    constructor(props) {
        super(props);
        props.node.component = this;
    }
}

class Identifier extends ASTNode {
    render() {
        return <span>{this.props.node.name}</span>;
    }
}

class VariableDeclarator extends ASTNode {
    render() {
        let { id, init } = this.props.node;
        if (init) {
            return <span>{maybeRender(id)} = {maybeRender(init)}</span>;
        } else {
            return <span>{maybeRender(id)}</span>;
        }
    }
}

class LineComment extends ASTNode {
    render() {
        let style = {
            color: "rgb(76, 136, 107)"
        };
        return <div style={style}>// {this.props.node.content}</div>;
    };
}

class BlockComment extends ASTNode {
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

class ClassDeclaration extends ASTNode {
    // TODO handle 'extends' syntax
    render() {
        let { node } = this.props;
        let id = maybeRender(node.id);
        let body = maybeRender(node.body);
        let open = " {";
        let close = "}";

        // TODO handle indentation of nested classes
        return <div>
            <div>
                {maybeRender(node["class"])}
                {" "}
                <span>{id}</span>{open}
            </div>
            <div>{body}</div>
            {close}
        </div>;
    }
}

class ClassBody extends ASTNode {
    render() {
        let defs = this.props.node.body.map(def => {
            let result = maybeRender(def);
            result.props.indent = "    ";
            return result;
        });
        return <div>{defs}</div>
    }
}

class MethodDefinition extends ASTNode {
    render() {
        let { node } = this.props;
        let key = maybeRender(node.key);
        let value = maybeRender(node.value);
        value.props.method = true;
        value.props.indent = this.props.indent;
        return <div>{this.props.indent}{key}{value}</div>;
    }
}

class FunctionExpression extends ASTNode {
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

class Placeholder extends ASTNode {
    render() {
        return <span>?</span>;
    }
}

class ReturnStatement extends ASTNode {
    render() {
        let { node } = this.props;
        return <div>{this.props.indent}{maybeRender(node["return"])} {maybeRender(node.argument)};</div>;
    }
}

class VariableDeclaration extends ASTNode {
    render() {
        let decl = maybeRender(this.props.node.declarations[0]);
        let kind = maybeRender(this.props.node.kind);
        return <span>{kind} {decl}</span>;
    }
}

class ExpressionStatement extends ASTNode {
    render() {
        let { node } = this.props;
        let expression = maybeRender(node.expression);
        return <div>{this.props.indent}{expression};</div>;
    }
}

class BlockStatement extends ASTNode {
    render() {
        let children = this.props.node.body.map(child => {
            let result = maybeRender(child);
            result.props.indent = this.props.indent;
            return result;
        });
        return <div style={this.props.style}>{children}</div>;
    }
}

class BlankStatement extends ASTNode {
    render() {
        let { node } = this.props;
        return <div>{"\u200b"}</div>;
    }
}

class AssignmentExpression extends ASTNode {
    render() {
        let left = maybeRender(this.props.node.left);
        let right = maybeRender(this.props.node.right);
        let operator = maybeRender(this.props.node.operator);
        return <span>{left} {operator} {right}</span>;
    }
}

class CallExpression extends ASTNode {
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

class ForOfStatement extends ASTNode {
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
                {maybeRender(node.for)} ({left} {maybeRender(node.of)} {right}) {open}
            </div>
            {block}
            <div>
                {close}
            </div>
        </div>;
    }
}

class BinaryExpression extends ASTNode {
    render() {
        let left = maybeRender(this.props.node.left);
        let right = maybeRender(this.props.node.right);
        let operator = maybeRender(this.props.node.operator);
        return <span>{left} {operator} {right}</span>;
    }
}

class ArrayExpression extends ASTNode {
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

class NumberLiteral extends ASTNode {
    render() {
        return <span style={{color:"#00B"}}>{this.props.node.value}</span>;
    }
}

class StringLiteral extends ASTNode {
    render() {
        return <span style={{color:"#900"}}>"{this.props.node.value}"</span>;
    }
}

class Operator extends ASTNode {
    render() {
        return <span>{this.props.node.operator}</span>;
    }
}

class Keyword extends ASTNode {
    render() {
        return <span style={{color:"#00F"}}>{this.props.node.keyword}</span>;
    }
}

class Parentheses extends ASTNode {
    render() {
        let { node } = this.props;
        return <span>({maybeRender(node.expression)})</span>;
    }
}

class Program extends ASTNode {
    render() {
        let style = {
            position: 'absolute',
            top: 0,
            left: 45
        };
        
        let { node } = this.props;

        let children = node.body.map(child => maybeRender(child));
        return <div style={style}>{children}</div>;
    }
}

let components = {
    ForOfStatement,
    VariableDeclaration,
    VariableDeclarator,
    Identifier,
    ArrayExpression,
    NumberLiteral,
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
    Operator,
    Keyword,
    Parentheses
};

maybeRender = function(node) {
    if (components[node.type]) {
        return React.createElement(components[node.type], { node });
    } else {
        return <span>{node.type}</span>;
    }
};

export { Program };
