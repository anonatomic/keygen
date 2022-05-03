const path = require('path');
const nodeExternals = require('webpack-node-externals');
const distDir = path.resolve(__dirname, 'dist');

module.exports = {
    mode: process.env.NODE_ENV,
    target: 'node',
    
    externals:[nodeExternals()],

    context: path.resolve(__dirname, 'src'),
    
    entry: './bootstrap.ts',
    
    output:{
        path: distDir,
        filename:'server.bundle.js',
        devtoolModuleFilenameTemplate: '[absolute-resource-path]'
    },
    
    optimization:{
        minimize: false
    },

    devtool: 'source-map',

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ },
        
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { test: /\.js$/, use: "source-map-loader", exclude:/node_modules/ },
        ],
    },
}