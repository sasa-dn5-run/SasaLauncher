import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { Configuration } from 'webpack'
require('dotenv').config()

const configs:Configuration[] = [
    {
        name: 'renderer',
        cache: {
            type: 'filesystem',
        },
        entry: [
            './src/renderer/index.tsx'
        ],
        output: {
            path: path.resolve(__dirname, 'dist', 'main', 'app'),
            publicPath: './',
            filename: '[name].js',
            assetModuleFilename: 'assets/[name][ext]',
            devtoolModuleFilenameTemplate: '[absolute-resource-path]'
        },
        module: {
            rules: [
                {
                    test: /\.tsx$|\.ts$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.scss$/,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: { sourceMap: true },
                        },
                        'sass-loader',
                    ],
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/renderer/index.html',
                filename: 'index.html',
                scriptLoading: 'blocking',
                inject: 'body',
                minify: false,
            }),
        ],
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
        target: 'web',
        devtool: 'source-map',
    },
    {
        name: 'main',
        cache: {
            type: 'filesystem',
        },
        entry: {
            index: './src/main/index.ts',
            preload: './src/preload/index.ts',
        },
        output: {
            path: path.resolve(__dirname, 'dist', 'main'),
            filename: '[name].js',
            devtoolModuleFilenameTemplate: '[absolute-resource-path]'
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.ts$/,
                    loader: 'string-replace-loader',
                    options: {
                        multiple: [
                            {
                                search: /\${{MS_APP_ID}}/g,
                                replace: process.env.MS_APP_ID,
                            },
                            {
                                search: /\${{MS_APP_SECRET}}/g,
                                replace: process.env.MS_APP_SECRET,
                            },
                            {
                                search: /\${{MS_APP_URL}}/g,
                                replace: process.env.MS_APP_URL,
                            }
                        ]
                    }
                }
            ],
        },
        plugins: [],
        resolve: {
            extensions: ['.ts', '.tsx', '.js', 'jsx'],
        },
        target: 'electron-main',
        devtool: 'source-map',
    }
]

export default configs
