import React, { Component } from 'react'

class Gutter extends Component {
    render() {
        let count = this.props.count;
        let style = {
            width: 40,
            textAlign: 'right',
            backgroundColor: '#CCC',
            paddingRight: 3
        };
        let lines = [];
        for (let i = 0; i < count; i++) {
            lines.push(<div>{i+1}</div>);
        }

        return <div style={style}>
            {lines}
        </div>;
    }
}

export default Gutter
