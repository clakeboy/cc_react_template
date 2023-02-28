/**
 * Created by CLAKE on 2016/8/9.
 */
import webpack from 'webpack';
import path from 'path';
import process from 'process';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

let ENV = process.env.NODE_ENV;
// var ip = require('ip');

let node_modules = path.resolve(__dirname, 'node_modules');
let react = path.resolve(node_modules, 'react/dict/react.js');
const MONACO_DIR = path.resolve(__dirname, './node_modules/monaco-editor');
// const ip_address = ip.address();

export default {
    //页面入口文件配置
    mode: 'production',
    plugins: [
        new MonacoWebpackPlugin({
            // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
            languages: ['json','javascript','php','html','yaml','css'],
        })
    ],
    output: {
        path: `${__dirname}/dist`,
        filename: '[name].js',
        chunkFilename:`./manage/chunk/[name].[chunkhash:8].js`
    },
    module: {
        rules: [
            { test: /\.woff[2]?$/, use: "url-loader?limit=10000&mimetype=application/font-woff" },
            { test: /\.ttf$/,  use: "url-loader?limit=10000&mimetype=application/octet-stream" },
            { test: /\.eot$/,  use: "file-loader" },
            { test: /\.svg$/,  use: "url-loader?limit=10000&mimetype=image/svg+xml" },
            {
                test: /\.jsx$/,
                use: {loader:'babel-loader',
                    // query:{presets:["@babel/preset-env", "@babel/preset-react"]},
                    options: {
                        presets: [
                            ['@babel/preset-env'],
                            ['@babel/preset-react'],
                        ]
                    }
                },
                // exclude: /node_modules/
            },
            {
                test: /\.js$/,
                // use: {loader:'babel-loader',query:{presets:["@babel/preset-env", "@babel/preset-react"]}},
                use: {loader:'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env'],
                            ['@babel/preset-react'],
                        ]
                    }
                },
                // exclude: /node_modules/
            },
            {
                test: /\.(jpe?g|png|gif)$/i,
                use: 'url-loader?limit=10000&name=img/[hash:8].[name].[ext]'
            }
        ]
    },
    //其它解决方案配置
    resolve: {
        extensions: [ '.js', '.json', '.less', '.jsx']
    },
    node: {
        fs: 'empty'
    },
    externals: {
        "jquery": "jQuery",
        "react": "React",
        "react-dom": "ReactDOM",
        "zepto": "Zepto",
        "marked":"Marked",
        "moment":"moment"
    }
};