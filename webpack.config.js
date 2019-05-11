const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const appConfig = require("./appconfig");

function srcPath(subdir) {
    return path.join(__dirname, "src", subdir);
}

module.exports = {
    entry: "./src/index.tsx",
    mode: 'development',
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist"
    },
    devtool: "source-map",

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json", '.less'],
        alias: {
            lib: srcPath('lib'),
            requests: srcPath('lib/Requests'),
            common: srcPath('lib/common'),
            utils: srcPath('utils'),
            actions: srcPath('actions'),
            app: srcPath('app'),
            routes: srcPath('routes'),
            styles: srcPath('styles'),
            static_data: srcPath('static_data'),
            models: srcPath('models'),
        }
    },

    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: "awesome-typescript-loader"
        }, {
            enforce: "pre",
            test: /\.js$/,
            loader: "source-map-loader"
        }, {
            test: /\.less$/,
            use: [MiniCssExtractPlugin.loader,
                'css-loader',
                {
                    loader: 'less-loader',
                    options: { sourceMap: true }
                }
            ]
        }]
    },

    externals: {
        "react": "React",
        "react-dom": "ReactDOM",
        "raven": "Raven"
    },

    plugins: [
        new MiniCssExtractPlugin({ filename: './styles/[name].css' }),
        new webpack.DefinePlugin(appConfig)
    ]
};