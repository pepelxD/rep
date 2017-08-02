'use strict';

const $ = require('gulp-load-plugins')();
const gulp = require('gulp');
const combiner = require('stream-combiner2').obj;

const isDevelop = !process.env.NODE_ENV || process.env.NODE_ENV == 'develop';

module.exports = function (options) {
    return function () {
        return combiner(
            gulp.src([
                options.path.src.scssDir
            ]),
            $.debug({title: 'src'}),
            $.if(isDevelop, $.sourcemaps.init()),
            $.sass(options.sassOptions),
            $.groupCssMediaQueries(),
            $.autoprefixer({
                browsers: ['last 4 versions', 'ie 9']
            }),
            $.rename(function (path) {
                path.dirname += '/css';
                path.basename = 'main' ? 'style' : path.basename;
            }),
            $.if(isDevelop, $.sourcemaps.write('.')),
            $.if(!isDevelop, $.csso()),
            gulp.dest(options.path.build.dir),
            $.debug({title: 'dest'})
        ).on('error', $.notify.onError(function (err) {
            return {
                title: 'sass',
                message: err.message
            }
        }));
    };

};