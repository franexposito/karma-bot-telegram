var gulp = require('gulp'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  sass = require('gulp-sass'),
  server = require( 'gulp-develop-server' ),
  livereload = require( 'gulp-livereload' ),
  minifycss =require('gulp-minify-css'),
  bower = require('gulp-bower');

var filesToMove = [
  "./src/public/assets/**/*",
  "./src/public/views/**/*",
  "./src/server/**/*",
  "./src/index.js",
  "./src/server/logs/"
];

var options = {
  path: './build/index.js'
};

var serverFiles = [
  './build/index.js',
  './build/server/controllers/*.js',
  './build/server/models/*.js',
  './build/server/*.js'
];

gulp.task('styles', function() {
  gulp.src('src/public/styles/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(minifycss())
    .pipe(gulp.dest('./build/public/styles/'));
});

gulp.task('minify', function() {
  return gulp.src([
      'src/public/js/*.js'
    ])
    .pipe(concat('app.min.js'))
    .pipe(uglify({
      compress: {
        drop_console: true
      }
    }))
    .pipe(gulp.dest('build/public/js/'));
});

gulp.task('move', function() {
  gulp.src(filesToMove, { base: './src' })
    .pipe(gulp.dest('build'));
});

gulp.task('bower_install', function() {
  return bower();
});

gulp.task('watch-js', function() {
  gulp.watch('src/public/js/*.js', ['minify']);
  gulp.watch('src/public/styles/*.scss', ['minify']);
  gulp.watch(filesToMove, ['move']);
});

// -- Tasks --------------------------------------------------------------------
gulp.task('watch', function() {
  gulp.watch('./src/public/js/*.js', ['minify']);
  gulp.watch('./src/public/styles/*.scss', ['styles']);
  gulp.watch(filesToMove, ['move']);
  return;
});

gulp.task('build', ['watch'], function() {
  gulp.start(['minify', 'styles', 'move']);
  return;
});

// -- Run ----------------------------------------------------------------------
gulp.task( 'server:start', ['build', 'minify', 'styles', 'move'], function() {
  server.listen( options, livereload.listen );
});

gulp.task( 'default', ['server:start'], function() {
  function restart( file ) {
    server.changed( function( error ) {
      if( ! error ) livereload.changed( file.path );
    });
  }

  gulp.watch(serverFiles).on( 'change', restart );
});

gulp.task('bower', function() {
  gulp.start(['bower_install']);
  return;
});
