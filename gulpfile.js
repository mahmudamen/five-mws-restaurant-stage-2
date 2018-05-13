var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');

gulp.task('default', ['copy-html', 'copy-images', 'styles','s-w', 'scripts'], function() {

	browserSync.init({
		server: './dist',
		port: 8000
	});

	gulp.watch('sass/**/*.scss', ['styles']);
	gulp.watch('js/**/*.js', ['scripts']);
	gulp.watch('/*.html', ['copy-html']);
	gulp.watch('./sw.js', ['sw']);
	gulp.watch('./dist/*.html').on('change', browserSync.reload);
});
gulp.task('scripts2', function() {
    return gulp.src(['js/app.js','js/idb.js','js/dbhelper.js','js/main.js'])
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist/js/indexBundle'));
});
gulp.task('dist', [
	'copy-html',
	'copy-images',
	'styles',
	'scripts-dist'
]);

gulp.task('scripts', function() {
	gulp.src('js/**/*.js')
		.pipe(gulp.dest('dist/js'));
});

gulp.task('scripts-dist', function() {
	gulp.src('js/**/*.js')
		.pipe(concat('all.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'));
});

gulp.task('copy-html', function() {
	gulp.src(['./index.html', './restaurant.html'])
		.pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', function() {
	gulp.src('img/*')
		.pipe(gulp.dest('dist/img'));
});
gulp.task('s-w', function() {
	gulp.src('./sw.js')
		.pipe(gulp.dest('./dist'));

	gulp.src('./manifest.json')
		.pipe(gulp.dest('./dist'));
});
gulp.task('styles', function() {
	gulp.src('sass/**/*.scss')
		.pipe(sass({
			outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.stream());
});
