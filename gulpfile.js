var gulp = require('gulp');
var gutil = require( 'gulp-util' );
// var filter = require('gulp-filter');
//var changed = require('gulp-changed');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minify = require('gulp-cssnano');
var plumber = require( 'gulp-plumber' );
var del = require('del');

/**
 * 错误处理
 */
function error (event) {
  gutil.beep();
  gutil.log(event);
}

/**
 * 清除 public/assets_admin
 */
gulp.task('clean', function(cb) {
  return del(['./public/assets/admin/**/*'], cb);
});

/**
 * 开发模式编译 Less
 */
gulp.task('build-admin-assets', ['clean'], function () {
  return gulp.src('./src/admin/less/import.less')
    .pipe(plumber({ errorHandler: error }))
    .pipe(less())
    .pipe(concat('main.css'))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('./public/assets/admin/'));
});

/**
 * 生产模式编译 Less
 */
gulp.task('build-admin-assets-less', ['clean'], function () {
  return gulp.src('./src/admin/less/import.less')
    .pipe(less())
    .pipe(concat('main.css'))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(minify())
    .pipe(gulp.dest('./public/assets/admin/'));
});

/**
 * 开发模式合并 admin js
 */
gulp.task('concat-admin-js', ['clean'], function () {
  return gulp.src(['./src/admin/main.js', './src/admin/controllers/*.js', './src/admin/services/*.js', './src/admin/directives/*.js', './src/admin/filters/*.js'])
    .pipe(plumber({ errorHandler: error }))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./public/assets/admin/'));
});

/**
 * 开发模式合并 admin js
 */
gulp.task('concat-admin-js-less', ['clean'], function () {
  return gulp.src(['./src/admin/main.js', './src/admin/controllers/*.js', './src/admin/services/*.js', './src/admin/directives/*.js', './src/admin/filters/*.js'])
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/assets/admin/'));
});

/**
 * 拷贝 src/admin/ 到 public/assets/admin/
 */
gulp.task('copy-admin-assets', ['clean'], function () {
  return gulp.src([
    './src/admin/index.html',
    './src/admin/notInstalled.html',
    './src/admin/vendor/**/*',
    './src/admin/images/**/*',
    './src/admin/views/**/*'
  ], { base: './src/admin/' })
    .pipe(gulp.dest('./public/assets/admin/'));
});

/**
 * 开发模式监视文件
 */
gulp.task('watch-assets-admin', function () {
  gulp.watch('./src/admin/**/*', ['build-admin-assets', 'concat-admin-js', 'copy-admin-assets']);
});

/**
 * 默认开发模式编译
 */
gulp.task('default', ['watch-assets-admin', 'build-admin-assets', 'concat-admin-js', 'copy-admin-assets']);

/**
 * 生产模式编译
 */
gulp.task('build', ['build-admin-assets-less', 'concat-admin-js-less', 'copy-admin-assets']);