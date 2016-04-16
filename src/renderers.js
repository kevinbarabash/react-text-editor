import React, { Component } from 'react';
import { connect } from 'react-redux';

import store from './store';

/*** Stateful leaf nodes ***/

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
            backgroundColor: this.props.selected ? "#9CF" : "",
        };

        return <span onClick={this.handleClick} style={style}>
            {this.props.node.name}
        </span>;
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
            backgroundColor: this.props.selected ? "#9CF" : "",
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
            backgroundColor: this.props.selected ? "#9CF" : "",
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
            backgroundColor: this.props.selected ? "#9CF" : "",
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
            backgroundColor: this.props.selected ? "#9CF" : "",
        };

        return <span onClick={this.handleClick} style={style}>
            {node.keyword}
        </span>;
    }
}

class LineComment extends Component {
    render() {
        const style = {
            color: "rgb(76, 136, 107)"
        };
        return <div style={style}>// {this.props.node.content}</div>;
    };
}

class BlockComment extends Component {
    render() {
        const style = {
            color: "rgb(76, 136, 107)"
        };
        const lines = this.props.node.content.split("\n").map((line, index) => {
            return <div key={index}>{" * " + line}</div>;
        });

        return <div style={style}>
            <div>{"/*"}</div>
            {lines}
            <div>{" */"}</div>
        </div>;
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
            backgroundColor: this.props.selected ? "#9CF" : "",
        };

        return <span onClick={this.handleClick} style={style}>?</span>;
    }
}


/*** Stateless nodes ***/

const VariableDeclarator = (props) => {
    const { id, init } = props.node;

    if (init) {
        return <span>
            <ConnectedNode node={id}/> = <ConnectedNode node={init}/>
        </span>;
    } else {
        return <span>
            <ConnectedNode node={id}/>
        </span>;
    }
};


// TODO handle 'extends' syntax
const ClassDeclaration = (props) =>{
    const { node } = props;
    const id = <ConnectedNode node={node.id} />;
    const body = <ConnectedNode node={node.body} />;
    const open = " {";
    const close = "}";

    // TODO handle indentation of nested classes
    return <div>
        <div>
            {<ConnectedNode node={node['class']} />}
            {' '}
            <span>{id}</span>{open}
        </div>
        <div>{body}</div>
        {close}
    </div>;
};

const ClassBody = (props) => {
    const nodes = store.getState().nodes;
    const defs = nodes[props.node.body.id].map((def, index) => {
        return <ConnectedNode node={def} indent={'    '} key={`child-${index}`} />;
    });
    return <div>{defs}</div>
};

const MethodDefinition = (props) => {
    const { indent, node: { key, value } } = props;

    return <div>
        {indent}
        <ConnectedNode node={key} />
        <ConnectedNode node={value} method={true} indent={indent} />
    </div>;
};

const FunctionExpression = (props) => {
    const { indent, node, method } = props;

    const open = "{";
    const close = indent + "}";
    const body = <ConnectedNode node={node.body} indent={indent + "    "} />;

    const params = [];

    const nodes = store.getState().nodes;
    nodes[node.params.id].forEach((param, index) => {
        if (index > 0) {
            params.push(", ");
        }
        params.push(<ConnectedNode node={param} key={`param-${index}`} />);
    });

    return method
        ? <span>({params}) {open}<div>{body}</div>{close}</span>
        : <span>not a method</span>;
};

const ReturnStatement = (props) => {
    const { indent, node } = props;

    return <div>
        {indent}
        <ConnectedNode node={node['return']} />
        {' '}
        <ConnectedNode node={node.argument} />
    </div>;
};

const VariableDeclaration = (props) => {
    const nodes = store.getState().nodes;
    const decls = nodes[props.node.declarations.id];

    return <span>
        <ConnectedNode node={props.node.kind} />
        {' '}
        <ConnectedNode node={decls[0]} />
    </span>;
};

const ExpressionStatement = (props) => {
    const { indent, node: { expression } } = props;

    return <div>{indent}<ConnectedNode node={expression} />;</div>;
};

const BlockStatement = (props) => {
    const { indent, node: { body } } = props;
    const nodes = store.getState().nodes;

    const children = nodes[body.id].map((child, index) =>
         <ConnectedNode node={child} indent={indent} key={`stmt-${index}`} />);

    return <div style={props.style}>{children}</div>;
};

const BlankStatement = () => {
    return <div>{"\u200b"}</div>;
};

const AssignmentExpression = (props) => {
    const { left, operator, right } = props.node;

    return <span>
        <ConnectedNode node={left} />
        {' '}
        <ConnectedNode node={operator} />
        {' '}
        <ConnectedNode node={right} />
    </span>;
};

const CallExpression = (props) => {
    const args = [];
    const nodes = store.getState().nodes;

    nodes[props.node.arguments.id].forEach((arg, index) => {
        if (index > 0) {
            args.push(", ");
        }
        args.push(<ConnectedNode node={arg} key={`arg-${index}`}/>);
    });

    return <span>
        <ConnectedNode node={props.node.callee} />
        ({args})
    </span>;
};

const ForOfStatement = (props) => {
    const { node } = props;

    const left = <ConnectedNode node={node.left}/>;
    const right = <ConnectedNode node={node.right}/>;
    const block = <ConnectedNode node={node.body} indent={'    '} />;
    const open = "{";
    const close = "}";

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
};

const BinaryExpression = (props) => {
    const { left, operator, right } = props.node;

    return <span>
        <ConnectedNode node={left} />
        {' '}
        <ConnectedNode node={operator} />
        {' '}
        <ConnectedNode node={right} />
    </span>;
};

const ArrayExpression = (props) => {
    const elements = [];
    const nodes = store.getState().nodes;

    nodes[props.node.elements.id].forEach((element, index) => {
        if (index > 0) {
            elements.push(", ");
        }
        elements.push(<ConnectedNode node={element} key={`item-${index}`} />);
    });

    return <span>[{elements}]</span>;
};

const Parentheses = (props) => {
    return <span>(<ConnectedNode node={props.node.expression} />)</span>;
};

const Program = (props) => {
    const style = {
        position: 'absolute',
        top: 0,
        left: 45
    };

    const { body } = props.node;
    const nodes = store.getState().nodes;

    const children = nodes[body.id].map((child, index) =>
        <ConnectedNode node={child} key={`stmt-${index}`} />);

    return <div style={style}>{children}</div>;
};

const components = {
    /* stateful nodes */
    Identifier,
    NumberLiteral,
    LineComment,
    BlockComment,
    Placeholder,
    StringLiteral,
    Operator,
    Keyword,

    /* stateless nodes */
    ForOfStatement,
    VariableDeclaration,
    VariableDeclarator,
    ArrayExpression,
    BlockStatement,
    ExpressionStatement,
    BlankStatement,
    AssignmentExpression,
    BinaryExpression,
    CallExpression,
    ClassDeclaration,
    ClassBody,
    MethodDefinition,
    FunctionExpression,
    ReturnStatement,
    Parentheses,
    Program,
};

function mapStateToProps(state, ownProps) {
    return {
        id: ownProps.node.id,
        node: state.nodes[ownProps.node.id],
        selected: state.selectedNode === ownProps.node.id
    };
}

const Node = (props) => {
    const node = props.node;
    const Element = components[node.type];

    return Element
        ? <Element { ...props }/>
        : <span>{node.type}</span>;
};

const ConnectedNode = connect(mapStateToProps)(Node);

export default ConnectedNode;
