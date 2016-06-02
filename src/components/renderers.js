import React, { Component } from 'react';
import { connect } from 'react-redux';

import Cursor from './Cursor';
import store from '../store';

/*** Stateful leaf nodes ***/

class Identifier extends Component {
    handleClick = (e) => {
        const name = this.props.node.name;

        const span = this._span;
        const bounds = span.getBoundingClientRect();
        const width = bounds.right - bounds.left;

        const charWidth = width / name.length;
        const pos = Math.round((e.pageX - bounds.left) / charWidth);

        store.dispatch({
            type: 'SELECT',
            id: this.props.id,
            node: this.props.node,
            pos: pos,
        });
    };

    render() {
        let content = this.props.node.name;
        const { selection } = this.props;

        if (selection) {
            const before = content.substring(0, selection.pos);
            const after = content.substring(selection.pos);
            content = [
                <span key='before'>{before}</span>,
                <Cursor key='cursor' pos={selection.pos}/>,
                <span key='after'>{after}</span>
            ];
        }

        return <span
            onClick={this.handleClick}
            ref={node => this._span = node}
            style={{color: "#000"}}
        >
            {content}
        </span>;
    }
}

class NumberLiteral extends Component {
    handleClick = (e) => {
        const value = this.props.node.value;

        const span = this._span;
        const bounds = span.getBoundingClientRect();
        const width = bounds.right - bounds.left;

        const charWidth = width / value.length;
        const pos = Math.round((e.pageX - bounds.left) / charWidth);

        store.dispatch({
            type: 'SELECT',
            id: this.props.id,
            node: this.props.node,
            pos: pos,
        });
    };

    render() {
        let content = this.props.node.value;
        const { selection } = this.props;

        if (selection) {
            const selection = store.getState().selection;
            const before = content.substring(0, selection.pos);
            const after = content.substring(selection.pos);
            content = [
                <span key='before'>{before}</span>,
                <Cursor key='cursor' pos={selection.pos}/>,
                <span key='after'>{after}</span>
            ];
        }

        return <span
            onClick={this.handleClick}
            ref={node => this._span = node}
            style={{color: "#00B"}}
        >
            {content}
        </span>;
    }
}

class StringLiteral extends Component {
    handleClick = (e) => {
        const value = `"${this.props.node.value}"`;

        const span = this._span;
        const bounds = span.getBoundingClientRect();
        const width = bounds.right - bounds.left;

        const charWidth = width / value.length;
        const pos = Math.round((e.pageX - bounds.left) / charWidth);

        store.dispatch({
            type: 'SELECT',
            id: this.props.id,
            node: this.props.node,
            pos: pos,
        });
    };

    render() {
        let content = `"${this.props.node.value}"`;
        const { selection } = this.props;

        if (selection) {
            const selection = store.getState().selection;
            const before = content.substring(0, selection.pos);
            const after = content.substring(selection.pos);
            content = [
                <span key='before'>{before}</span>,
                <Cursor key='cursor' pos={selection.pos}/>,
                <span key='after'>{after}</span>
            ];
        }

        // TODO: check whether a user types ' or " to start a string
        return <span
            onClick={this.handleClick}
            ref={node => this._span = node}
            style={{color: "#900"}}
        >
            {content}
        </span>;
    }
}

class Operator extends Component {
    handleClick = (e) => {
        const value = this.props.node.operator;

        const span = this._span;
        const bounds = span.getBoundingClientRect();
        const width = bounds.right - bounds.left;

        const charWidth = width / value.length;
        const pos = Math.round((e.pageX - bounds.left) / charWidth);

        store.dispatch({
            type: 'SELECT',
            node: this.props.node,
            id: this.props.id,
            pos: pos,
        });
    };

    render() {
        let content = this.props.node.operator;
        const { selection } = this.props;

        if (selection) {
            const selection = store.getState().selection;
            const before = content.substring(0, selection.pos);
            const after = content.substring(selection.pos);
            content = [
                <span key='before'>{before}</span>,
                <Cursor key='cursor' pos={selection.pos}/>,
                <span key='after'>{after}</span>
            ];
        }

        const style = {
            color: "#000",
            marginLeft: '0.5em',
            marginRight: '0.5em',
        };

        return <span
            onClick={this.handleClick}
            ref={node => this._span = node}
            style={style}
        >
            {content}
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
        const { selection } = this.props;

        const style = {
            color: "#00F",
            backgroundColor: selection ? "#9CF" : "",
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
        const { selection } = this.props;

        const style = {
            color: "#000",
            backgroundColor: selection ? "#9CF" : "",
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
    const state = store.getState();
    const body = state.nodes.get(props.node.body);
    const defs = body.map((def, index) => {
        return <ConnectedNode node={def} key={`child-${index}`} />;
    });

    const style = {
        marginLeft: 40,
    };
    return <div style={style}>{defs}</div>
};

const MethodDefinition = (props) => {
    return <div>
        <ConnectedNode node={props.node.key} />
        <ConnectedNode node={props.node.value} method={true} />
    </div>;
};

const FunctionExpression = (props) => {
    const { node, method } = props;

    const open = "{";
    const close = "}";
    const body = <ConnectedNode node={node.body} />;
    const params = <ConnectedNode node={node.params} />;

    return method
        ? <span>({params}) {open}<div>{body}</div>{close}</span>
        : <span>not a method</span>;
};

const ReturnStatement = (props) => {
    return <div>
        <ConnectedNode node={props.node['return']} />
        {' '}
        <ConnectedNode node={props.node.argument} />
    </div>;
};

const VariableDeclaration = (props) => {
    const state = store.getState();
    const decls = state.nodes.get(props.node.declarations);

    return <span>
        <ConnectedNode node={props.node.kind} />
        {' '}
        <ConnectedNode node={decls[0]} />
    </span>;
};

const ExpressionStatement = (props) => {
    return <div><ConnectedNode node={props.node.expression} />;</div>;
};

const BlockStatement = (props) => {
    const state = store.getState();
    const body = state.nodes.get(props.node.body);
    const children = body.map((child, index) =>
         <ConnectedNode node={child} key={`stmt-${index}`} />);

    const style = {
        marginLeft: 40
    };

    return <div style={style}>{children}</div>;
};

const BlankStatement = (props) => {
    const contents = ["\u200b"];
    if (props.selection) {
        contents.push(<Cursor key='cursor' pos={0} />);
    }
    return <div>{contents}</div>;
};

const AssignmentExpression = (props) => {
    const { left, operator, right } = props.node;

    return <span>
        <ConnectedNode node={left} />
        <ConnectedNode node={operator} />
        <ConnectedNode node={right} />
    </span>;
};

const CallExpression = (props) => {
    return <span>
        <ConnectedNode node={props.node.callee} />
        (<ConnectedNode node={props.node.arguments} />)
    </span>;
};

const ForOfStatement = (props) => {
    const { node } = props;

    const left = <ConnectedNode node={node.left} />;
    const right = <ConnectedNode node={node.right} />;
    const block = <ConnectedNode node={node.body} />;
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
        <ConnectedNode node={operator} />
        <ConnectedNode node={right} />
    </span>;
};

const ArrayExpression = (props) => {
    return <span>[<ConnectedNode node={props.node.elements} />]</span>;
};

const Parentheses = (props) => {
    return <span>(<ConnectedNode node={props.node.expression} />)</span>;
};

const MathExpression = (props) => {
    return <ConnectedNode type='MathExpression' node={props.node.children} />;
};

const Program = (props) => {
    const style = {
        position: 'absolute',
        top: 0,
        left: 45
    };

    const state = store.getState();
    const body = state.nodes.get(props.node.body);
    const children = body.map((child, index) =>
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
    MathExpression,
    Program,
};

function mapStateToProps(state, ownProps) {
    if (state.selection && state.selection.id === ownProps.node) {
        return {
            id: ownProps.node,
            node: state.nodes.get(ownProps.node),
            selection: state.selection,
        };
    } else {
        return {
            id: ownProps.node,
            node: state.nodes.get(ownProps.node),
        };
    }
}

const Node = (props) => {
    const node = props.node;
    const type = props.type;

    if (Array.isArray(node)) {
        const contents = [];

        if (type === 'MathExpression') {
            node.forEach((item, index) => {
                contents.push(<ConnectedNode node={item} key={`item-${index}`}/>);
            });
        } else {
            node.forEach((item, index) => {
                if (index > 0) contents.push(", ");
                contents.push(<ConnectedNode node={item} key={`item-${index}`}/>);
            });
        }

        return <span>{contents}</span>;
    } else {
        const Element = components[node.type];
        return Element ? <Element { ...props } /> : <span>{node.type}</span>;
    }
};

const ConnectedNode = connect(mapStateToProps)(Node);

export default ConnectedNode;
