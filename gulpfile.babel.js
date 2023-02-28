/**
 * Created by CLAKE on 2016/8/7.
 */
import gulp from 'gulp';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import gutil from 'gulp-util';
import pkg from './package.json';
import readline from 'readline';
import fs from 'fs';
import YAML from 'yaml';

import historyApiFallback from 'connect-history-api-fallback';

const $ = gulpLoadPlugins();

const banner = `/** ${pkg.title} v${pkg.version} | by Clake
  * (c) ${$.util.date(Date.now(), 'UTC:yyyy')} Clake,
  * ${$.util.date(Date.now(), 'isoDateTime')}
  */
  `;

let destConf = {
    destDir:'',//输出目录
    ignore: [], //不需要复制的文件列表，支持glob语法
};
if (fs.existsSync('./.dist')) {
    let con = fs.readFileSync('./.dist','utf8');
    let conf = YAML.parse(con)
    destConf = Object.assign({},destConf,conf);
}

const replaceVersion = function() {
    return $.replace('__VERSION__', pkg.version);
};

const addBanner = function() {
    return $.header(banner);
};

gulp.task('server', () => {
    let webpackConfigDev = require('./webpack.dev').default;
    const bundler = webpack(webpackConfigDev);
    const bs = browserSync.create();

    bs.init({
        logPrefix: 'AMT',
        server: {
            baseDir: ['dist'],
            middleware: [
                historyApiFallback(),
                webpackDevMiddleware(bundler, {
                    publicPath: '/',  //webpackConfig.output.publicPath,
                    stats: {colors: true},
                    lazy:false,
                    watchOptions:{
                        aggregateTimeout: 300,
                        poll: true
                    }
                }),
                webpackHotMiddleware(bundler)
            ]
        }
    });
});

gulp.task('clean', (callback) => {
    del([
        'dist/*',
        '!dist/vendor',
        '!dist/static',
        '!dist/favicon.ico',
        '!dist/favicon.png'
    ]);
    callback();
});

gulp.task('build:pack', (callback)=>{
    let webpackConfig = require('./webpack.prod').default;
// return gulp.src('dist/*.js')
//     .pipe(replaceVersion())
//     .pipe(addBanner())
//     // .pipe($.rename('ticket_manage.min.js'))
//     // .pipe(gulp.dest(paths.dist))
//     .pipe($.rename({suffix: '.min'}))
//     .pipe(gulp.dest(paths.dist));
// gulp.start('webpack');
// webpackStream(webpackConfig,null, function(err, stats) {
//     if(err) throw new gutil.PluginError("webpack", err);
//     gutil.log("[webpack]", stats.toString({
//         color:true
//     }));
//     callback();
// });
    webpack(webpackConfig,function(err,stats){
        if (err) {
            gutil.log("[webpack]", err);
        } else {
            gutil.log("[webpack]", stats.toString({
                colors:true
            }));
        }
        callback();
    });
});

gulp.task('dist:path',(callback)=>{
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    // process.stdin.write(paths.appDist)
    let qes = ()=>{
        rl.question('请输入目录地址：',(addr)=>{
            if (!fs.existsSync(addr)) {
                console.log('输出目录不存在！请输入正确的输出目录')
                qes();
                return
                // callback(new Error('输出目录不存在！请重新执行'))
            }
            destConf.destDir = addr;
            fs.writeFileSync('./.dist',YAML.stringify(destConf))
            rl.close();
            callback();
        })
    }
    //如果目录存在就直接执行
    if (destConf.destDir === '') {
        console.log('默认目录可以配置根目录文件".dist",本次输入会自动生成配置文件 ".dist"')
    } else {
        if (fs.existsSync(destConf.destDir)) {
            rl.close();
            callback();
            return
        } else {
            console.log('默认目录不存在请重新输入！')
        }
    }
    qes();
    process.stdin.push(destConf.destDir);
    rl.on('SIGINT', () => {
        rl.close();
        callback(new Error('已退出执行！'))
    });
})

gulp.task('dist:clean',(callback)=>{
    let delList = [
        `${destConf.destDir}/*`
    ];
    if (destConf.ignore && destConf.ignore.length > 0) {
        destConf.ignore.forEach((item)=>{
            if (item[0] === '#') {
                delList.push('!'+destConf.destDir+item.substring(1));
            } else {
                delList.push('!'+destConf.destDir+item);
            }
        })
    }
    del(delList,{
        force:true,
    })
    callback();
})

gulp.task('dist:pack',()=>{
    let srcList = [
        'dist/**'
    ]
    if (destConf.ignore && destConf.ignore.length > 0) {
        destConf.ignore.forEach((item)=>{
            if (item[0] === '#') {
                if (fs.existsSync(destConf.destDir+item.substring(1))) {
                    srcList.push('!'+'dist'+item.substring(1));
                }
            } else {
                srcList.push('!'+'dist'+item);
            }
        })
    }
    // if (!fs.existsSync(destConf.destDir+'/vendor')) {
    //     return gulp.src(['dist/**'])
    //         .pipe(gulp.dest(destConf.destDir))
    // }
    return gulp.src(srcList)
        .pipe(gulp.dest(destConf.destDir))
})

gulp.task('dist',gulp.series('dist:path','dist:clean','dist:pack'))

gulp.task('default', gulp.series('server'));

gulp.task('build',gulp.series('clean','build:pack'));

gulp.task('build-dist',gulp.series('build','dist'))