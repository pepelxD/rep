'use strict';
const gulp = require('gulp');
const config = require('./gulpConfig.json');

function requireTask(taskName, path, options) {
    options = options || {};
    options.taskName = taskName;
    gulp.task(taskName, function (callback) {
        let task = require(path).call(this, options);

        return task(callback);
    });
}
const del = require('del');
const watch = require('gulp-watch');
const newer = require('gulp-newer');
const path = require('path');
const imagemin = require('gulp-imagemin');




var isDevelop = !process.env.NODE_ENV || process.env.NODE_ENV == 'develop';
// для windows:
// set NODE_ENV=prod - далее команды gulp, будет собираться продакшен версия.
//set NODE_ENV=develop - далее команды gulp, будет собираться develop версия.
// linux системы:
//NODE_ENV=prod {команда} - для сборки продакшена, иначе собирается develop версия

requireTask('imgsprite', config.path.tasks.imgsprite, config);

requireTask('sass', config.path.tasks.sass, config);

gulp.task('html', function () {
    return gulp.src('dev/**/*.html')
        .pipe(debug({title: 'src'}))
        .pipe(newer('app')) // сравнивает по дате модификации
        .pipe(gulp.dest('app'))
        .pipe(debug({title: 'dest'}));
});

gulp.task('img', function () {
    return gulp.src(['dev/**/*.{jpg,jpeg,png,gif,svg}', '!dev/**/sprite/*.{jpg,jpeg,png,gif,svg}'])
        .pipe(newer('app'))
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng(),
            imagemin.svgo({plugins: [{removeViewBox: true}]})
        ]))
        .pipe(gulp.dest('dev'))
        .pipe(gulp.dest('app'));
});
  
// test string


gulp.task('font', function () {
    return gulp.src('dev/**/*.{ttf,otf,woff2, woff}')
        .pipe(newer('app'))
        .pipe(gulp.dest('app'));
});

gulp.task('js', function () {
    return gulp.src('dev/**/*.js')
        .pipe(debug({title: 'src'}))
        .pipe(newer('app'))
        .pipe(gulp.dest('app'))
        .pipe(debug({title: 'dest'}));
});

gulp.task('clean', function () {
    return del('app');
});

gulp.task('default', ['html', 'imgsprite', 'sass', 'img', 'font', 'js', 'watch']);

gulp.task('watch', function () {
    watch('dev/scss/**/*.scss', {readDelay: 500}, function (event, cb) {
        console.log(event.event + ' ' + event.path);
        gulp.start('sass');
    });
    watch('dev/**/*.html', function (event, cb) {
        gulp.start('html');
    });

    watch('dev/**/*.js', function (event, cb) {
        gulp.start('js');
    });

    watch('dev/**/*.{jpg,png}', function (event, cb) {
        gulp.start('img');
    }).on('unlink', function (file) {
        del('app/**/img/**/' + path.basename(file));
    });
});