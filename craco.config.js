const webpack = require('webpack');

module.exports = {
    webpack: {
        plugins: {
            add: [
                new webpack.ProvidePlugin({
                    process: "process/browser",
                    Buffer: ["buffer", "Buffer"],
                }),
            ]
        },
        configure: {
            module: {
                rules: [
                    {
                        test: /\.m?js/,
                        resolve: {
                            fullySpecified: false
                        }
                    }
                ]
            },
            resolve: {
                fallback: {
                    path: require.resolve("path-browserify"),
                    crypto: require.resolve("crypto-browserify"),
                    stream: require.resolve("stream-browserify"),
                    "buffer": require.resolve("buffer")
                },
            },
        },
    },
};