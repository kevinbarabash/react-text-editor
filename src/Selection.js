import React, { Component } from 'react';

class Selection extends Component {
    render() {
        let charWidth = 9.60156;
        let lineHeight = 18;
        let gutterWidth = 45;

        let { node } = this.props;

        let style = {
            position: 'absolute',
            height: lineHeight,
            background: 'rgb(181, 213, 255)'
        };

        if (node.type === "BinaryExpression") {
            let line = node.left.loc.end.line;
            let column = node.left.loc.end.column + 1;

            Object.assign(style, {
                left: column * charWidth + gutterWidth,
                top: (line - 1) * lineHeight,
                width: charWidth * node.operator.length
            });
        } else if (node.type === "ReturnStatement") {
            let line = node.loc.start.line;
            let column = node.loc.start.column;
            Object.assign(style, {
                left: column * charWidth + gutterWidth,
                top: (line - 1) * lineHeight,
                width: charWidth * 6
            });
        } else {
            let loc = node.loc;
            Object.assign(style, {
                left: loc.start.column * charWidth + gutterWidth,
                top: (loc.start.line - 1) * lineHeight,
                width: charWidth * (loc.end.column - loc.start.column)
            });
        }

        return <div style={style}></div>;
    }
}

export default Selection;
