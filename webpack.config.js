const path = require('path');
function srcPath(subdir) {
    return path.join(__dirname, "src", subdir);
}

module.exports = {
    entry: "./src/index.tsx",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist"
    },
    devtool: "source-map",

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
        alias: {
            lib: srcPath('lib'),
            requests: srcPath('lib/requests'),
            utils: srcPath('utils'),
            actions: srcPath('actions'),
            app: srcPath('app'),
            routes: srcPath('routes')
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
            }]
    },

    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    }
};
