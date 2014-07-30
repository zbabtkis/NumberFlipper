var gulp = require('gulp')
  , uglify = require('gulp-uglify')
  , cssmin = require('gulp-cssmin');

gulp.task('uglify', function() {
  gulp.src('src/number-flipper.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/'));
});

gulp.task('cssmin', function() {
  gulp.src('css/number-flipper.css')
    .pipe(cssmin())
    .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['cssmin', 'uglify']);
