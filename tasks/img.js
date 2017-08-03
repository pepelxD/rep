'use strict';

const $ = require('gulp-load-plugins')();
const gulp = require('gulp');

const isDevelop = !process.env.NODE_ENV || process.env.NODE_ENV == 'develop';

module.exports = function (options) {
    return function () {
        return gulp.src([`${options.path.src.imgDir}/*.{jpg,jpeg,png,gif,svg}`, `!${options.path.src.dir}/**/${options.spritesFolder}/*.{jpg,jpeg,png,gif,svg}`])
            .pipe($.newer(`${options.path.build.dir}`))
            .pipe($.imagemin([
                $.imagemin.gifsicle({interlaced: true}),
                $.imagemin.jpegtran({progressive: true}),
                $.imagemin.optipng(),
                $.imagemin.svgo({plugins: [{removeViewBox: true}]})
            ]))
            .pipe(gulp.dest(`${options.path.src.dir}`))
            .pipe(gulp.dest(`${options.path.build.dir}`));
    };
};