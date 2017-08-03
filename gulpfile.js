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

requireTask('html', config.path.tasks.html, config);

requireTask('img', config.path.tasks.img, config);

requireTask('font', config.path.tasks.font, config);

requireTask('clean', config.path.tasks.clean, config);



gulp.task('js', function () {
    return gulp.src('dev/**/*.js')
        .pipe(debug({title: 'src'}))
        .pipe(newer('app'))
        .pipe(gulp.dest('app'))
        .pipe(debug({title: 'dest'}));
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