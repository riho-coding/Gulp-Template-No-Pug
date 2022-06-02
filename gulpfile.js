'use strict';

/*
 * Modules
 ****************************************************/

const
  gulp = require('gulp'),
  del = require('del'),
  sass = require('gulp-dart-sass'), // Sass
  postCSS = require('gulp-postcss'),
  prefix = require('autoprefixer'), // Adding Vendor Prefixes
  sorter = require('css-declaration-sorter'), // Sorting CSS properties
  mergeMediaQuery = require('gulp-merge-media-queries'), // Merging Media Queries
  sourcemaps = require('gulp-sourcemaps'), // Outputting Source map
  plumber = require('gulp-plumber'), // Keep watching if error occurred
  notify = require('gulp-notify'), // Error notification 
  browserSync = require('browser-sync').create(), // 
  minCSS = require('gulp-clean-css'), // Compress CSS file
  uglify = require('gulp-uglify'), // Compress JS file
  rename = require('gulp-rename'), // Rename compressed file
  HTMLBeautify = require('gulp-html-beautify'), // Format HTML
  minImg = require('gulp-imagemin'), // Compress images
  minPng = require('imagemin-pngquant'), // png
  minJpg = require('imagemin-mozjpeg'), // jpeg
  minSvg = require('imagemin-svgo'); // svg

/*
 * Sass
 ****************************************************/

function compileSass() {
  return gulp.src('./src/assets/scss/**/*.scss', { sourcemaps: true })
    .pipe(
      plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      })
    )
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(postCSS([
      prefix(),
      sorter({ order: 'smacss' })
    ]))
    .pipe(mergeMediaQuery())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/css/'))
    .pipe(minCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./dist/css/', { sourcemaps: './sourcemaps' }))
}

/*
 * JS
 ****************************************************/

function minJS() {
  return gulp.src('./src/assets/js/**/*.js')
    .pipe(
      plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      })
    )
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./dist/js/'))
}

/*
 * HTML
 ****************************************************/

function formatHTML() {
  return gulp.src("./src/**/*.html")
    .pipe(
      plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      })
    )
    .pipe(HTMLBeautify({
      indent_size: 2,
      indent_with_tabs: true,
    }))
    .pipe(gulp.dest("./dist/"))
}


/*
 * Image
 ****************************************************/

function compressImg() {
  return gulp.src('./src/assets/img/**/*')
    .pipe(minImg(
      [
        minJpg({ quality: 80 }),
        minPng({ quality: [.65, .80] }),
        minSvg({ plugin: [{ removeViewbox: false }] })
      ],
      { verbose: true }
    ))
    .pipe(gulp.dest('./dist/img/'))
}

/*
 * Watch
 ****************************************************/

function watch() {
  gulp.watch('./src/assets/img/**/*.*', gulp.series(compressImg, browserReload));
  gulp.watch('./src/**/*.html', gulp.series(formatHTML, browserReload));
  gulp.watch('./src/assets/scss/**/*.scss', gulp.series(compileSass, browserReload));
  gulp.watch('./src/assets/js/**/*.js', gulp.series(minJS, browserReload));
}

function browserInit(done) {
  browserSync.init({
    server: { baseDir: './dist' },
    open: "external",
  });
  done();
}

function browserReload(done) {
  browserSync.reload();
  done();
}

/*
 * Update dist file
 ****************************************************/

function update() {
  return del('./dist/**', { force: true });
}

/*
 * Exports
 ****************************************************/

exports.compileSass = compileSass;
exports.formatHTML = formatHTML;
exports.watch = watch;
exports.browserInit = browserInit;
exports.minJS = minJS;
exports.compressImg = compressImg;
exports.update = update;

exports.watch = gulp.parallel(browserInit, watch);

exports.compile
  = gulp.parallel(
    formatHTML,
    minJS,
    compressImg,
    compileSass);

exports.default
  = gulp.series(
    update,
    gulp.parallel(
      browserInit,
      formatHTML,
      minJS,
      compressImg,
      compileSass,
      watch)
  );
