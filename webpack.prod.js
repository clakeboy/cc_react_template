import webpack from 'webpack';
import merge from 'webpack-merge';
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import TerserJSPlugin from 'terser-webpack-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import HtmlWebpackPlugin from "html-webpack-plugin";
// import CustomPlugin from "./webpack_plugin/CustomPlugin";
import ChunkBuildMapPlugin from "chunk-build-map-webpack-plugin";
let cfg = require('./webpack.common').default;

export default merge(cfg,{
    entry: {
        //主文件
        index : './src/index.jsx'
    },
    //插件项
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].css"
        }),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production")
            }
        }),
        new HtmlWebpackPlugin({
            title: 'System Monitor',
            filename: 'index.html',
            template: `${__dirname}/src/assets/html/index.ejs`,
        }),
        new ChunkBuildMapPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader,'css-loader'],
            },
            {
                test: /\.less$/,
                use: [MiniCssExtractPlugin.loader,'css-loader','less-loader'],
            }
        ]
    },
    optimization: {
        // splitChunks: {
        //     minSize: 50000,
        //     minChunks: 2,
        //     cacheGroups: {
        //         commonFunc: {
        //             filename:'common.js',
        //             test:/\.js(x?)$/,
        //             chunks: "initial"
        //         }
        //     }
        // },
        chunkIds:'named',
        splitChunks: {
            cacheGroups: {
                styles: {
                    name: 'styles',
                    test: /\.css|\.less$/,
                    chunks: 'all',
                    enforce: true,
                },
                commonFunc: {
                    filename:'common.js',
                    test:/\.js$/,
                    chunks: "initial"
                }
            },
        },
        minimizer:[new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
    },
    mode: 'production',
});