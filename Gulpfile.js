var gulp = require('gulp')
  , uglify = require('gulp-uglify')
  , cssmin = require('gulp-cssmin')
  , mochaPhantomJs = require('gulp-mocha-phantomjs');

gulp.task('test', function() {
	var exp = gulp
		.src('test-runner.html')
		.pipe(mochaPhantomJs());

	return exp;
});

gulp.task('watch', function() {
	gulp.watch('src/*.js', ['test']);
	gulp.watch('test/*.js', ['test']);
});

gulp.task('uglify', function() {
  gulp.src([
		'src/helpers.js'], 
		['src/number-flipper.js'])
    .pipe(uglify())
    .pipe(gulp.dest('dist/'));
});

gulp.task('cssmin', function() {
  gulp.src('css/number-flipper.css')
    .pipe(cssmin())
    .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['cssmin', 'uglify']);
