import React, { Component } from 'react';
import { connect } from 'react-redux';

import store from './store';


class Identifier extends Component {
    handleClick = (e) => {
        store.dispatch({
            type: 'SELECT',
            node: this.props.node,
            id: this.props.id,
        });
    };

    render() {
        const style = {
            color: "#000",
            backgroundColor: this.props.node.selected ? "#9CF" : "",
        };

        return <span onClick={this.handleClick} style={style}>
            {this.props.node.name}
        </span>;
    }
}

class VariableDeclarator extends Component {
    render() {
        let { id, init } = this.props.node;
        if (init) {
            return <span>
                <ConnectedNode node={id}/> = <ConnectedNode node={init}/>
            </span>;
        } else {
            return <span>
                <ConnectedNode node={id}/>
            </span>;
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
        let lines = this.props.node.content.split("\n").map((line, index) => {
            return <div key={index}>{" * " + line}</div>;
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
        let id = <ConnectedNode node={node.id} />;
        let body = <ConnectedNode node={node.body} />;
        let open = " {";
        let close = "}";

        // TODO handle indentation of nested classes
        return <div>
            <div>
                {<ConnectedNode node={node["class"]} />}
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
        const state = store.getState();
        let defs = state[this.props.node.body.id].map((def, index) => {
            return <ConnectedNode node={def} indent={'    '} key={`child-${index}`} />;
        });
        return <div>{defs}</div>
    }
}

class MethodDefinition extends Component {
    render() {
        const { indent, node: { key, value } } = this.props;

        return <div>
            {indent}
            <ConnectedNode node={key} />
            <ConnectedNode node={value} method={true} indent={indent} />
        </div>;
    }
}

class FunctionExpression extends Component {
    render() {
        let open = "{";
        let close = this.props.indent + "}";
        let body = <ConnectedNode node={this.props.node.body} indent={this.props.indent + "    "} />;

        let { node } = this.props;
        let params = [];

        const state = store.getState();
        state[node.params.id].forEach((param, index) => {
            if (index > 0) {
                params.push(", ");
            }
            params.push(<ConnectedNode node={param} key={`param-${index}`} />);
        });

        if (this.props.method) {
            return <span>({params}) {open}<div>{body}</div>{close}</span>;
        } else {
            return <span>not a method</span>
        }
    }
}

class Placeholder extends Component {
    handleClick = (e) => {
        store.dispatch({
            type: 'SELECT',
            node: this.props.node,
            id: this.props.id,
        });
    };

    render() {
        const style = {
            color: "#000",
            backgroundColor: this.props.node.selected ? "#9CF" : "",
        };

        return <span onClick={this.handleClick} style={style}>?</span>;
    }
}

class ReturnStatement extends Component {
    render() {
        let { node } = this.props;
        return <div>
            {this.props.indent}
            <ConnectedNode node={node['return']} />
            {' '}
            <ConnectedNode node={node.argument} />
        </div>;
    }
}

class VariableDeclaration extends Component {
    render() {
        const state = store.getState();
        const decls = state[this.props.node.declarations.id];
        return <span>
            <ConnectedNode node={this.props.node.kind} />
            {' '}
            <ConnectedNode node={decls[0]} />
        </span>;
    }
}

class ExpressionStatement extends Component {
    render() {
        let { node } = this.props;
        let expression = <ConnectedNode node={node.expression} />;
        return <div>{this.props.indent}{expression};</div>;
    }
}

class BlockStatement extends Component {
    render() {
        const { indent, node: { body } } = this.props;
        const state = store.getState();
        let children = state[body.id].map((child, index) =>
             <ConnectedNode node={child} indent={indent} key={`stmt-${index}`} />);

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
        const { left, operator, right } = this.props.node;
        return <span>
            <ConnectedNode node={left} />
            {' '}
            <ConnectedNode node={operator} />
            {' '}
            <ConnectedNode node={right} />
        </span>
    }
}

class CallExpression extends Component {
    render() {
        let callee = <ConnectedNode node={this.props.node.callee} />;
        let args = [];
        const state = store.getState();
        state[this.props.node.arguments.id].forEach((arg, index) => {
            if (index > 0) {
                args.push(", ");
            }
            args.push(<ConnectedNode node={arg} key={`arg-${index}`}/>);
        });
        return <span>{callee}({args})</span>;
    }
}

class ForOfStatement extends Component {
    render() {
        let { node } = this.props;
        let left = <ConnectedNode node={node.left}/>;
        let right = <ConnectedNode node={node.right}/>;
        let block = <ConnectedNode node={node.body} indent={'    '} />;
        let open = "{";
        let close = "}";

        // TODO handle indentation
        return <div>
            <div>
                <ConnectedNode node={node.for}/> ({left} <ConnectedNode node={node.of}/> {right}) {open}
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
        let left = <ConnectedNode node={this.props.node.left} />;
        let right = <ConnectedNode node={this.props.node.right} />;
        let operator = <ConnectedNode node={this.props.node.operator} />;
        return <span>{left} {operator} {right}</span>;
    }
}

class ArrayExpression extends Component {
    render() {
        let elements = [];
        const state = store.getState();
        state[this.props.node.elements.id].forEach((element, index) => {
            if (index > 0) {
                elements.push(", ");
            }
            elements.push(<ConnectedNode node={element} key={`item-${index}`} />);
        });
        return <span>[{elements}]</span>;
    }
}

class NumberLiteral extends Component {
    handleClick = (e) => {
        store.dispatch({
            type: 'SELECT',
            node: this.props.node,
            id: this.props.id,
        });
    };

    render() {
        const style = {
            color: "#00B",
            backgroundColor: this.props.node.selected ? "#9CF" : "",
        };

        return <span onClick={this.handleClick} style={style}>
            {this.props.node.value}
        </span>;
    }
}

class StringLiteral extends Component {
    handleClick = (e) => {
        store.dispatch({
            type: 'SELECT',
            node: this.props.node,
            id: this.props.id,
        });
    };

    render() {
        const style = {
            color: "#900",
            backgroundColor: this.props.node.selected ? "#9CF" : "",
        };

        // TODO: check whether a user types ' or " to start a string
        return <span onClick={this.handleClick} style={style}>
            "{this.props.node.value}"
        </span>;
    }
}

class Operator extends Component {
    handleClick = (e) => {
        store.dispatch({
            type: 'SELECT',
            node: this.props.node,
            id: this.props.id,
        });
    };

    render() {
        const style = {
            color: "#000",
            backgroundColor: this.props.node.selected ? "#9CF" : "",
        };

        return <span onClick={this.handleClick} style={style}>
            {this.props.node.operator}
        </span>;
    }
}

class Keyword extends Component {
    handleClick = (e) => {
        store.dispatch({
            type: 'SELECT',
            node: this.props.node,
            id: this.props.id,
        });
    };

    render() {
        const node = this.props.node;

        const style = {
            color: "#00F",
            backgroundColor: this.props.node.selected ? "#9CF" : "",
        };

        return <span onClick={this.handleClick} style={style}>
            {node.keyword}
        </span>;
    }
}

class Parentheses extends Component {
    render() {
        let { expression } = this.props.node;
        return <span>(<ConnectedNode node={expression} />)</span>;
    }
}

class Program extends Component {
    render() {
        const style = {
            position: 'absolute',
            top: 0,
            left: 45
        };

        const { body } = this.props.node;
        const state = store.getState();
        const children = state[body.id].map((child, index) =>
            <ConnectedNode node={child} key={`stmt-${index}`} />);

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
    Parentheses,
    Program,
};

function mapStateToProps(state, ownProps) {
    const node = state[ownProps.node.id];
    return {
        node: node,
        id: ownProps.node.id,
    };
}

class Node extends Component {
    render() {
        const node = this.props.node;

        if (components[node.type]) {
            const Element = components[node.type];
            return <Element { ...this.props }/>;
        } else {
            return <span>{node.type}</span>;
        }
    }
}

const ConnectedNode = connect(mapStateToProps)(Node);

export default ConnectedNode;
