var gulp = require('gulp')
  , uglify = require('gulp-uglifyjs')
  , cssmin = require('gulp-cssmin')
  , concat = require('gulp-concat')
  , livereload = require('gulp-livereload')
  , tinylr     = require('tiny-lr')()
  , mochaPhantomJs = require('gulp-mocha-phantomjs');

function startExpress() {
  // Server for livereload
  var express = require('express')
    , lr      = require('connect-livereload');

  var app = express();

  app.use(lr({port: 4002}));
  app.use(express.static(__dirname));
  app.listen(4000);
}

function startLiveReload() {
  tinylr.listen(4002);
}

function reload(evt) {
  var filename = require('path').relative(__dirname, evt.path);

  console.log('change', filename);

  tinylr.changed({
    body: {
      files:  [filename]
    }
  });
}

gulp.task('test', function() {
	var exp = gulp
		.src('test-runner.html')
		.pipe(mochaPhantomJs());

	return exp;
});

gulp.task('watch', function() {
  startExpress();
  startLiveReload();

	gulp.watch('src/*.js', ['test', 'uglify']);
	gulp.watch('test/*.js', ['test']);
  gulp.watch('dist/*', reload); 
});

gulp.task('uglify', function() {
  gulp.src([
		'src/helpers.js', 
		'src/number-flipper.js'])
		.pipe(concat('number-flipper.min.js'))
    .pipe(uglify({outSourceMap: true}))
    .pipe(gulp.dest('dist'));
});

gulp.task('cssmin', function() {
  gulp.src('css/number-flipper.css')
    .pipe(cssmin())
    .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['cssmin', 'uglify']);
