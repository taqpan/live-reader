const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    const config = {
        entry: {
            'js/background': path.resolve(__dirname, 'src/js/background.js'),
            'js/popup': path.resolve(__dirname, 'src/js/popup.js'),
            'css/popup': path.resolve(__dirname, 'src/scss/popup.scss'),
            'js/options': path.resolve(__dirname, 'src/js/options.js'),
            'css/options': path.resolve(__dirname, 'src/scss/options.scss')
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].js',
            publicPath: '/dist/'
        },
        devtool: 'source-map',
        devServer: {
            port: 8080,
            contentBase: 'dist'
        },
        resolve: {
            extensions: ['.js'],
            alias: {
                'vue$': 'vue/dist/vue.esm.js'
            }
        },
        optimization: {
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: !isProduction
                }),
                new OptimizeCssAssetsPlugin({})
            ]
        },
        performance: { hints: false },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: [
                        { loader: 'babel-loader' },
                        { loader: 'eslint-loader' }
                    ],
                    exclude: /node_modules/
                },
                {
                    test: /\.vue$/,
                    use: [
                        { loader: 'vue-loader' }
                    ]
                },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                minimize: isProduction,
                                sourceMap: !isProduction
                            }
                        }
                    ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                minimize: isProduction,
                                sourceMap: !isProduction
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: !isProduction
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new VueLoaderPlugin(),
            new CopyWebpackPlugin([
                { from: 'src/manifest.json', to: '.' },
                { from: 'src/*.html', to: './[name].html' },
                { from: 'src/image/', to: './image/' }
            ]),
            new MiniCssExtractPlugin({
                filename: '[name].css'
            })
        ]
    };

    if (isProduction) {
        config.plugins.unshift(new CleanWebpackPlugin('dist'));
    }

    return [config];
}