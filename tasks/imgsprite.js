'use strict';

const $ = require('gulp-load-plugins')();
const gulp = require('gulp');

const merge = require('merge-stream');
const glob = require("glob").Glob;

const isDevelop = !process.env.NODE_ENV || process.env.NODE_ENV == 'develop';

console.dir($)

module.exports = function (options) {

    return function () {
        var tmp = new glob(`dev/**/${options.spritesFolder}/**/*.{jpg,jpeg,png,gif}`, {}, function (err, matches) {
            var files = [];
            function createItem(arr, i, prop, item) {
                arr[i] = {};
                arr[i][prop] = [];
                arr[i][prop].push(item)
                if (!arr[i].fileName && !arr[i].destPath) {
                    var pos = item.indexOf(options.spritesFolder);
                    var start = item.indexOf('/', pos) + 1;
                    var end = item.indexOf('/', start);
                    arr[i].fileName = item.slice(start, end);
                    arr[i].destPath = item.slice(0, pos).replace(options.path.src.dir, options.path.build.dir);
                }
            }
            var j = 0;
            matches.forEach((item, i, arr) => {
                var pos = item.lastIndexOf('/');
                if (files.length === 0) {
                    createItem(files, j, 'data', item);
                } else if (files[j].data[files[j].data.length - 1].includes(item.slice(0, pos))) {
                    files[j].data.push(item);
                } else {
                    j++;
                    createItem(files, j, 'data', item);
                }
            });
            files.forEach((item, i, arr) => {
                var spriteData = gulp.src(arr[i].data)
                    .pipe($.spritesmith({
                        imgName: arr[i].fileName + '.png',
                        cssName: arr[i].fileName + '.scss',
                        imgPath: '../img/' + arr[i].fileName + '.png'
                    }));
                var stylStream = spriteData.css
                    .pipe(gulp.dest('tmp/sprites/'));

                var imgStream = spriteData.img
                    .pipe(gulp.dest(arr[i].destPath))

                return merge(imgStream, stylStream);
            });
        });
    };

};