/*------------------------------------
  Default Gulp Stuff
------------------------------------ */

// Gulp.js configuration
'use strict';

// source and build folders
const dir = {
  src         : './library/_src/',
  build       : './library/'
},

// Load the required packages
gulp          = require('gulp'),
plumber       = require('gulp-plumber'),
gutil         = require('gulp-util'),
notify        = require('gulp-notify'),
newer         = require('gulp-newer'),
rename        = require('gulp-rename'),
deporder      = require('gulp-deporder'),
concat        = require('gulp-concat'),
imagemin      = require('gulp-imagemin'),
sass          = require('gulp-sass'),
postcss       = require('gulp-postcss'),
jshint        = require('gulp-jshint'),
stylish       = require('jshint-stylish'),
uglify        = require('gulp-uglify')
;

/*------------------------------------
  Error Handling
------------------------------------ */
var plumberErrorHandler = {
  errorHandler: notify.onError({
    title: 'Gulp',
    message: 'Error: <%= error.message %>'
  })
};

/*------------------------------------
  Image Processing Setup
------------------------------------ */
// image settings
const images = {
  src         : dir.src + 'images/**/*',
  build       : dir.build + 'images/'
};

// image processing - run with "gulp images"
gulp.task('images', () => {
  return gulp.src(images.src)
    .pipe(newer(images.build))
    .pipe(plumber(plumberErrorHandler))
    .pipe(imagemin({optimizationLevel: 7, progressive: true}))
    .pipe(gulp.dest(images.build));
});

/*------------------------------------
  CSS/Sass Setup
------------------------------------ */
var css = {
  src : dir.src + 'scss/style.scss',
  watch : dir.src + 'scss/**/*',
  build : dir.build + 'css/',
  sassOpts: {
    outputStyle : 'nested',
    errLogToConsole : true
  },
  processors: [
    require('autoprefixer')({
      browsers: ['last 2 versions', '> 2%']
    }),
  ],
  minify: [
    require('cssnano'), // Compress and Minify CSS
  ],
};

// CSS processing - run this task with "gulp css"
gulp.task('css', ['images'], () => {
  return gulp.src(css.src)
    .pipe(plumber(plumberErrorHandler))
    .pipe(sass(css.sassOpts))
    .pipe(postcss(css.processors))
    .pipe(gulp.dest(css.build))
    .pipe(postcss(css.minify))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(css.build))
    .pipe(notify({
        title: 'CSS Task',
        message: 'CSS Task Complete!'
      })
    )
});

/*------------------------------------
  JS task to go here
------------------------------------ */
// Setup the vars for our js task
var js = {
  src : dir.src + 'js/**/*',
  build : dir.build + 'js/',
  filename : 'scripts.js'
};

// JavaScript processing
gulp.task('js', () => {
  return gulp.src(js.src)
    .pipe(plumber(plumberErrorHandler)) // If there is an error, trigger the notify popup
    // NOTICE: Files in .jshintignore will be ignore by the linting
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(deporder())
    .pipe(concat(js.filename))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest(js.build))
    .pipe(notify({
        title: 'JS Task',
        message: 'JS Task Complete!'
      })
    )
});

/*------------------------------------
  Browsersync
------------------------------------ */
var browsersync = require('browser-sync').create();
var reload = browsersync.reload;

// Browsersync options
const syncOpts = {
  files       : dir.build + '**/*',
  notify      : false,
  proxy: 'localhost/html-boiler'
}

// browsersync
gulp.task('watch', function() {
  browsersync.init(syncOpts);

  // page changes
  gulp.watch("./**/*.php").on("change", browsersync ? browsersync.reload : {});
  gulp.watch("./**/*.html").on("change", browsersync ? browsersync.reload : {});

  // Image Changes
  gulp.watch(images.src, ['images']);

  // css/scss changes
  gulp.watch(css.watch, ['css', reload]);

  // js changes
  gulp.watch(js.src, ['js', reload]);

});

/*------------------------------------
Default Task - Just "gulp"
------------------------------------ */
gulp.task('default', ['css', 'js', 'watch']);
