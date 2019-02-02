var gulp = require('gulp');
var uglify = require('gulp-uglify')
var rename = require("gulp-rename")
gulp.task('script', function() {
    gulp.src('./js/common.js')
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
});
