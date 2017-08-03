'use strict';

const $ = require('gulp-load-plugins')();
const gulp = require('gulp');

const isDevelop = !process.env.NODE_ENV || process.env.NODE_ENV == 'develop';

module.exports = function (options) {
    return function () {
        return gulp.src(`${options.path.src.dir}/**/*.{ttf,otf,woff2, woff}`)
        .pipe($.newer(options.path.build.dir))
        .pipe(gulp.dest(options.path.build.dir));
    };
};