'use strict';

const gulp             = require('gulp');

const sass             = require('gulp-sass');
const sourcemaps       = require('gulp-sourcemaps')
const rename           = require('gulp-rename');
const autoprefixer     = require('gulp-autoprefixer');
const debug            = require('gulp-debug');
const gulpIf           = require('gulp-if');
const del              = require('del');
const watch            = require('gulp-watch');
const newer            = require('gulp-newer');
const notify           = require('gulp-notify');
const combiner         = require('stream-combiner2').obj;
const gcmq             = require('gulp-group-css-media-queries');
const path             = require('path');
const csso             = require('gulp-csso'); //разобраться
const imagemin         = require('gulp-imagemin');
const spriteImg        = require('gulp.spritesmith');

const merge = require('merge-stream');
const glob = require("glob").Glob;

const config = require('./config.json');


var isDevelop = !process.env.NODE_ENV || process.env.NODE_ENV == 'develop';
// для windows:
// set NODE_ENV=prod - далее команды gulp, будет собираться продакшен версия.
//set NODE_ENV=develop - далее команды gulp, будет собираться develop версия.
// linux системы:
//NODE_ENV=prod {команда} - для сборки продакшена, иначе собирается develop версия

//======== Sass Options =========//
var sassOptions = {};
if(isDevelop) {
    sassOptions.outputStyle = 'expanded';
    sassOptions.indentType = 'tab';
    sassOptions.indentWidth = 1;
}
sassOptions.includePaths = [`${process.cwd()}/tmp/**/*.scss`];
//==============================//

gulp.task('sass', function() {
    return combiner(
        gulp.src([
                    'dev/scss/**/*.scss'
        ]),
        debug({title: 'src'}),
        gulpIf(isDevelop, sourcemaps.init()),
        sass( sassOptions ),
        gcmq(),
        autoprefixer({
                browsers: ['last 4 versions', 'ie 9' ]
            }),
        rename(function (path) {
            path.dirname += '/css';
            path.basename = 'main' ? 'style' : path.basename;
        }),
        gulpIf(isDevelop, sourcemaps.write('.')),
        gulpIf(!isDevelop, csso()),
        gulp.dest('app'),
        debug({title: 'dest'})
    ).on('error', notify.onError(function(err){
            return {
                title: 'sass',
                message: err.message
            }
    }));
    
});

gulp.task('html', function() {
  return gulp.src('dev/**/*.html')
    .pipe(debug({title: 'src'}))
    .pipe(newer('app')) // сравнивает по дате модификации
    .pipe(gulp.dest('app'))
    .pipe(debug({title: 'dest'}));
});

gulp.task('img', function() {
  return gulp.src(['dev/**/*.{jpg,jpeg,png,gif,svg}', '!dev/**/sprite/*.{jpg,jpeg,png,gif,svg}'])
    .pipe( newer('app'))
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.jpegtran({progressive: true}),
        imagemin.optipng(),
        imagemin.svgo({plugins: [{removeViewBox: true}]})
    ]))
    .pipe(gulp.dest('dev'))
    .pipe(gulp.dest('app'));
});
gulp.task('imgsprite', function() {
    var tmp = new glob(`dev/**/${config.spritesFolder}/**/*.{jpg,jpeg,png,gif}`, {}, function(err, matches) {
    var files = [];
    function createItem(arr, i, prop, item) {
        arr[i] = {};
        arr[i][prop] = [];
        arr[i][prop].push(item)
        if(!arr[i].fileName && !arr[i].destPath) {
            var pos = item.indexOf(config.spritesFolder);
            var start = item.indexOf('/', pos) + 1;
            var end = item.indexOf('/', start);
            arr[i].fileName = item.slice(start, end);
            arr[i].destPath = item.slice(0, pos).replace(config.path.src.dir, config.path.build.dir);
        }
    } 
    var j = 0;
    matches.forEach((item, i, arr) => {
         var pos = item.lastIndexOf('/');
         if(files.length === 0) {
             createItem(files, j, 'data', item);
         } else if(files[j].data[files[j].data.length - 1].includes(item.slice(0, pos))) {
             files[j].data.push(item);
         } else {
             j++;
             createItem(files, j, 'data', item);
         }
    });
    files.forEach((item, i, arr) => {
        var spriteData = gulp.src(arr[i].data)
            .pipe(spriteImg({
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
});



gulp.task('font', function() {
  return gulp.src('dev/**/*.{ttf,otf,woff2, woff}')
    .pipe( newer('app'))
    .pipe(gulp.dest('app'));
});

gulp.task('js', function() {
  return gulp.src('dev/**/*.js')
    .pipe(debug({title: 'src'}))
    .pipe( newer('app'))
    .pipe(gulp.dest('app'))
    .pipe(debug({title: 'dest'}));
});

gulp.task('clean', function() {
  return del('app');
});

gulp.task('default',['html','imgsprite','sass','img','font','js','watch']);

gulp.task('watch', function() {
    watch('dev/scss/**/*.scss', {readDelay: 500}, function(event, cb) {
            console.log(event.event + ' ' + event.path);
            gulp.start('sass');
    });
    watch('dev/**/*.html', function(event, cb) {
            gulp.start('html');
    });
    
    watch('dev/**/*.js', function(event, cb) {
            gulp.start('js');
    });
   
   watch('dev/**/*.{jpg,png}', function(event, cb) {
            gulp.start('img');
    }).on('unlink', function(file){
        del('app/**/img/**/' + path.basename(file));
    });
});