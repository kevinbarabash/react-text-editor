var path = require('path');
var webpack = require('webpack');

module.exports = {
    devtool: '#eval-source-map',
    entry: {
        app: './src/index',
        deps: ['react', 'react-dom', 'redux', 'react-redux', 'immutable']
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].js'
    },
    plugins: [
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: { warnings: false }
        // }),
        // new webpack.DefinePlugin({
        //     "process.env": {
        //         NODE_ENV: JSON.stringify("production")
        //     }
        // }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'deps'
        })
    ],
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            loaders: ['babel'],
            include: path.join(__dirname, 'src')
        }]
    }
};
