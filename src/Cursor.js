import React, { Component } from 'react';

class Cursor extends Component {
    constructor() {
        super();
        this.state = {
            opacity: 1
        };
    }

    startBlinking() {
        this.interval = setInterval(() => {
            if (this.state.opacity === 1) {
                this.setState({ opacity: 0 });
            } else {
                this.setState({ opacity: 1 });
            }
        }, 500);
    }

    componentDidMount() {
        this.startBlinking();
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextProps.column !== this.props.column && nextProps.line !== this.props.line) {
            clearInterval(this.interval);
            this.startBlinking();
            this.setState({ opacity: 1 });
        }
    }

    render() {
        let cursorWidth = 2;
        let gutterWidth = 45;
        let { charWidth, charHeight } = this.props;
        let style = {
            position: 'absolute',
            left: this.props.column * charWidth - 1 + gutterWidth,
            top: (this.props.line - 1) * charHeight,
            width: cursorWidth,
            height: charHeight,
            background: 'black',
            opacity: this.props.visible ? this.state.opacity : 0
        };

        return <div style={style}></div>;
    }
}

Cursor.defaultProps = {
    visible: true
};

Cursor.propTypes = {
    visible: React.PropTypes.bool,
    charWidth: React.PropTypes.number,
    charHeight: React.PropTypes.number
};

export default Cursor;
