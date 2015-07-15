var gulp = require('gulp');
var gutil = require( 'gulp-util' )
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
gulp.task('clean', function(callback) {
  del(['./public/assets/admin/'], callback);
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
 * 拷贝 src/admin/index.html 到 public/assets/admin/
 */
gulp.task('copy-assets-admin-index', ['clean'], function() {
  return gulp.src('./src/admin/index.html')
    .pipe(gulp.dest('./public/assets/admin/'));
});

/**
 * 拷贝 src/admin/vendor 到 public/assets/admin/vendor
 */
gulp.task('copy-assets-admin-vendor', ['clean'], function() {
  return gulp.src('./src/admin/vendor/**/*')
    .pipe(gulp.dest('./public/assets/admin/vendor/'));
});

/**
 * 拷贝 src/admin/images 到 public/assets/admin/images
 */
gulp.task('copy-assets-admin-images', ['clean'], function() {
  return gulp.src('./src/admin/images/**/*')
    .pipe(gulp.dest('./public/assets/admin/images/'));
});

/**
 * 拷贝 src/admin/views 到 public/assets/admin/views
 */
gulp.task('copy-assets-admin-views', ['clean'], function() {
  return gulp.src('./src/admin/views/**/*')
    .pipe(gulp.dest('./public/assets/admin/views/'));
});

/**
 * 拷贝 src/admin/
 */
gulp.task('copy-assets-admin', [
  'copy-assets-admin-index',
  'copy-assets-admin-vendor',
  'copy-assets-admin-images',
  'copy-assets-admin-views'
]);

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