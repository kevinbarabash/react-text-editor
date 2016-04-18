import React, { Component } from 'react';

class Cursor extends Component {
    state = {
        opacity: 1
    };

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

    componentWillUpdate(nextProps, nextState) {
        if (this.props.pos !== nextProps.pos) {
            clearInterval(this.interval);
            this.setState({ opacity: 1 });
        }
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        const style = {
            display: 'inline-block',
            backgroundColor: 'black',
            width: 2,
            marginRight: -1,
            marginLeft: -1,
            opacity: this.state.opacity,
        };

        return <div style={style}>{'\u200b'}</div>
    }
}

export default Cursor;
