const autoprefixer = require('autoprefixer');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
    entry: {
        'js/background': path.resolve(__dirname, 'src/ts/background.ts'),
        'js/popup': path.resolve(__dirname, 'src/ts/popup.ts'),
        'css/popup': path.resolve(__dirname, 'src/scss/popup.scss'),
        'js/options': path.resolve(__dirname, 'src/ts/options.ts'),
        'css/options': path.resolve(__dirname, 'src/scss/options.scss')
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
                loader: 'ts-loader',
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                }
            },
            {
                test: /\.vue$/,
                exclude: /node_modules/,
                loader: 'vue-loader',
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
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
        new VueLoaderPlugin(),
        new CopyWebpackPlugin([
            { from: 'src/*.html', to: './[name].html' },
            { from: 'src/assets/', to: './assets/' }
        ]),
        new MiniCssExtractPlugin({
            filename: '[name].css'
        })
    ]
};
