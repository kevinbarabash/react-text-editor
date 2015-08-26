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
        let style = {
            position: 'absolute',
            left: this.props.column * 9.60156 - 1 + gutterWidth,
            top: this.props.line * 18,
            width: cursorWidth,
            height: 18,
            background: 'black',
            opacity: this.props.visible ? this.state.opacity : 0
        };

        return <div style={style}></div>;
    }
}

Cursor.defaultProps = {
    visible: true
};

export default Cursor;
