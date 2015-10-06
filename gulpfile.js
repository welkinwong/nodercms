var gulp = require('gulp');
var gutil = require( 'gulp-util' );
// var filter = require('gulp-filter');
var changed = require('gulp-changed');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
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
gulp.task('clean', function() {
  return del(['./public/assets/admin/**/*']);
});

/**
 * 编译 Less
 */
gulp.task('build-assets-admin-less', ['clean'], function () {
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
 * 合并 concat-assets-admin
 */
gulp.task('concat-assets-admin', ['clean'], function () {
  return gulp.src(['./src/admin/main.js', './src/admin/controllers/*.js', './src/admin/services/*.js', './src/admin/directives/*.js'])
    .pipe(plumber({ errorHandler: error }))
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/assets/admin/'));
});

/**
 * 拷贝 src/admin/ 到 public/assets/admin/
 */
gulp.task('copy-assets-admin', ['clean'], function () {
  return gulp.src([
    './src/admin/index.html',
    './src/admin/vendor/**/*',
    './src/admin/images/**/*',
    './src/admin/views/**/*'
  ], { base: './src/admin/' })
    .pipe(gulp.dest('./public/assets/admin/'));
});

/**
 * 监视
 */
gulp.task('watch-assets-admin', function () {
  gulp.watch('./src/admin/**/*', ['build-assets-admin-less', 'concat-assets-admin', 'copy-assets-admin']);
});

/**
 * 默认任务
 */
gulp.task('default', ['watch-assets-admin', 'build-assets-admin-less', 'concat-assets-admin', 'copy-assets-admin']);