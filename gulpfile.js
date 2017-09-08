// 共通機能
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var rimraf = require('rimraf');
var runSequence = require('run-sequence');
var notifier = require('node-notifier');

// ejs
var ejs = require('gulp-ejs');
var rename = require('gulp-rename');
var prettify = require('gulp-prettify');

// css
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');

// gulp-webserver
var browserSync = require('browser-sync').create();

// eslint
var eslint = require('gulp-eslint');

// sitemap
var sitemap = require('gulp-sitemap');


// 共通変数
var global = {
  src: './src',
  dist: './dist',
  build: './build',
  scss: './src/**/*.scss',
  ejs: './src/**/*.ejs',
  js: './src/**/*.js',
  excludeFile: {
    scss: '!./src/**/_*.scss',
    ejs: '!./src/**/_*.ejs'
  }
};


// ejs modules
var setPath = require('./ejs_modules/setPath');
var setPathArray = {
  // ルート相対フラグ （true:ルート相対, false:ファイル相対 初期値false）
  rootpath: false,
  // 作業フォルダの設定
  initpath: process.env.INIT_CWD + '\\src\\'
}

// gulp-ejs
gulp.task('ejs', function () {

  // ejs変換
  return gulp.src([global.ejs, global.excludeFile.ejs])
    .pipe(ejs({ setPathArray, setPath }))
    .pipe(rename(function (path) {
      path.extname = '.html';
    }))
    .pipe(prettify({
      indent_with_tabs: false,
      indent_size: 2,
      max_preserve_newlines: 1,
      preserve_newlines: true,
      unformatted: [
        'b', 'big', 'i', 'small', 'tt', 'abbr', 'acronym',
        'cite', 'code', 'dfn', 'em', 'kbd', 'strong', 'samp',
        'time', 'var', 'a', 'bdo', 'br', 'img', 'map', 'object',
        'q', 'span', 'sub', 'sup', 'button', 'input',
        'label', 'select', 'textarea',
      ]
    }))
    .pipe(gulp.dest(global.dist));
});

// sitemap
gulp.task('sitemap', function () {
  gulp.src([global.dist + '/**/*.html', '!' + global.dist + '/_filelist.html'], {
      read: false
    })
    .pipe(sitemap({
      siteUrl: './'
    }))
    .pipe(gulp.dest(global.dist));
});

// gulp-scss
gulp.task('sass', function () {
  return gulp.src([global.scss, global.excludeFile.scss])
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(sourcemaps.write('sourcemaps'))
    .pipe(gulp.dest(global.dist));
});

// gulp-scss (Exclusion SOURCEMAP)
gulp.task('sass-build', function () {
  return gulp.src([global.scss, global.excludeFile.scss])
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(gulp.dest(global.dist));
});

// fileCopy
gulp.task('copy', function () {
  return gulp.src([global.src + '/**/*.*', '!' + global.ejs, '!' + global.scss])
    .pipe(gulp.dest(global.dist));
});

// fileCopy
gulp.task('build-copy', function () {
  return gulp.src([global.dist + '/**/*.*'])
    .pipe(gulp.dest(global.build));
});

// Webサーバー
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: global.dist
        },
        open: 'external', //localhostではなくローカルIPでWebサーバー立ち上げ
        startPath: './_filelist.html'　//初期表示ページを指定
    });
});

// watch
gulp.task('watch', ['copy'], function () {
  gulp.watch([global.ejs, global.excludeFile.ejs], ['ejs']);
  gulp.watch([global.scss, global.excludeFile.scss], ['sass']);
  gulp.watch([global.src + '/**/*.*', global.excludeFile.ejs], ['copy']);
});

// delete-dist
gulp.task('delete-dist', function (cb) {
  rimraf(global.dist, cb);
});

// delete-build
gulp.task('delete-build', function (cb) {
  rimraf(global.build, cb);
});

// Default
gulp.task('default', function (callback) {
  runSequence(['sass', 'ejs', 'copy'], 'sitemap', 'browser-sync', 'watch', callback);
});

// build 納品ファイル作成
gulp.task('build', function (callback) {
  runSequence('delete-dist', ['sass-build', 'ejs', 'copy'], 'delete-build', 'build-copy', 'delete-dist', callback);
});

// eslint
gulp.task('lint', function () {
  return gulp.src([global.js])
    .pipe(plumber({
      // エラーをハンドル
      errorHandler: function (error) {
        var taskName = 'eslint';
        var title = '[task]' + taskName + ' ' + error.plugin;
        var errorMsg = 'error: ' + error.message;
        // ターミナルにエラーを出力
        console.error(title + '\n' + errorMsg);
        // エラーを通知
        notifier.notify({
          title: title,
          message: errorMsg,
          time: 3000
        });
      }
    }))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(plumber.stop());
});
