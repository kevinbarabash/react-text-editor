import React, { Component } from 'react';

import store from './store';

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

class ClassBody extends Component {
    render() {
        let defs = state[this.props.node.body.id].map(def => {
            let result = maybeRender(def, { indent: "    " });
            return result;
        });
        return <div>{defs}</div>
    }
}

class MethodDefinition extends Component {
    render() {
        let { node } = this.props;
        let key = maybeRender(node.key);
        let value = maybeRender(node.value, { method: true, indent: this.props.indent });
        return <div>{this.props.indent}{key}{value}</div>;
    }
}

class FunctionExpression extends Component {
    render() {
        let open = "{";
        let close = this.props.indent + "}";
        let body = maybeRender(this.props.node.body, { indent: this.props.indent + "    " });

        let { node } = this.props;
        let params = [];
        state[node.params.id].forEach((param, index) => {
            if (index > 0) {
                params.push(", ");
            }
            params.push(maybeRender(param));
        });

        if (this.props.method) {
            return <span>({params}) {open}<div>{body}</div>{close}</span>;
        } else {
            return <span>not a method</span>
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
        return <div>{this.props.indent}{maybeRender(node["return"])} {maybeRender(node.argument)};</div>;
    }
}

class VariableDeclaration extends Component {
    render() {
        const decls = state[this.props.node.declarations.id];
        let decl = maybeRender(decls[0]);
        let kind = maybeRender(this.props.node.kind);
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
        let children = state[this.props.node.body.id].map(child => {
            let result = maybeRender(child, { indent: this.props.indent });
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
        state[this.props.node.arguments.id].forEach((arg, index) => {
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
        let block = maybeRender(node.body, { indent: "    " });
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
        state[this.props.node.elements.id].forEach((element, index) => {
            if (index > 0) {
                elements.push(", ");
            }
            elements.push(maybeRender(element));
        });
        return <span>[{elements}]</span>;
    }
}

class NumberLiteral extends Component {
    render() {
        return <span style={{color:"#00B"}}>{this.props.node.value}</span>;
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

class Keyword extends Component {
    render() {
        return <span style={{color:"#00F"}}>{this.props.node.keyword}</span>;
    }
}

class Parentheses extends Component {
    render() {
        let { node } = this.props;
        return <span>({maybeRender(node.expression)})</span>;
    }
}

class Program extends Component {
    render() {
        let style = {
            position: 'absolute',
            top: 0,
            left: 45
        };

        let { node } = this.props;

        const body = state[node.body.id];

        let children = body.map(child => maybeRender(child));
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

const state = store.getState();

maybeRender = function(ref, props) {
    const node = state[ref.id];
    console.log(node);
    if (components[node.type]) {
        return React.createElement(components[node.type], { node: { ...node }, ...props });
    } else {
        return <span>{node.type}</span>;
    }
};

export { Program };
