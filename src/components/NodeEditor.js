import React, { Component } from 'react';

import Node from './renderers';
import Selection from './selection';
import Gutter from './gutter';

import store from '../store';

class NodeEditor extends Component {
    constructor(props) {
        super(props);

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

        // TODO: store scrollTop as part of state to maintain scrollTop position
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
            store.dispatch({ type: 'MOVE_LEFT' });
        } else if (e.keyCode === 39) {
            store.dispatch({ type: 'MOVE_RIGHT' });
        } else if (e.keyCode === 8) {
            store.dispatch({ type: 'DELETE' });
        }
    }

    handleKeyPress(e) {
        store.dispatch({
            type: 'INSERT',
            char: String.fromCharCode(e.charCode),
        });

        e.preventDefault();
    }

    componentWillMount() {
        // TODO extract this so that we can this this component
        // add location information to the AST
        // renderAST(this.props.node);

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

        const node = {
            id: 0
        };

        // TODO use the delegate pattern to determine cursor visibility
        return <div style={style}
                    onKeyDown={this.handleKeyDown}
                    onKeyPress={this.handleKeyPress}
                    tabIndex={0}>
            {selections}
            <Gutter count={100} />
            <Node node={0} />
        </div>;
    }
}

NodeEditor.propTypes = {
    lines: React.PropTypes.arrayOf(React.PropTypes.string)
};

export default NodeEditor;
