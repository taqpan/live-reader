const autoprefixer = require('autoprefixer');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require('webpack');

module.exports = {
    entry: {
        'js/background': path.resolve(__dirname, 'src/ts/background.ts'),
        'js/popup': path.resolve(__dirname, 'src/ts/popup.ts'),
        'js/options': path.resolve(__dirname, 'src/ts/options.ts'),
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js',
        publicPath: '/build/'
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    performance: { hints: false },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        appendTsSuffixTo: [/\.vue$/],
                    }
                }
            },
            {
                test: /\.vue$/,
                exclude: /node_modules/,
                use: {
                    loader: 'vue-loader',
                }
            },
            {
                test: /\.scss$/,
                use: [
                    // MiniCssExtractPlugin.loader,
                    'vue-style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true
                        }
                    },
                    { // postcssLoader
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: () => [
                                autoprefixer(),
                            ],
                        },
                    },
                    'sass-loader',
                ]
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            global: require.resolve('./global.js')
        }),
        new VueLoaderPlugin(),
        new CopyWebpackPlugin([
            { from: 'src/*.html', to: './[name].html' },
            { from: 'src/assets/', to: './assets/' }
        ]),
        new MiniCssExtractPlugin({
            filename: '[name].css'
        })
    ],
    node: {
        global: false
    }
};
