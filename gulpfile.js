var gulp    = require('gulp'),
    $       = require('gulp-load-plugins')()
    webpack = require('webpack');

gulp.task('compile', function () {
  return gulp.src('app/ts/**/*.ts')
    .pipe($.plumber())
    .pipe($.tsc({ noImplicitAny: true }))
    .pipe(gulp.dest('.tmp/js'));
});

gulp.task('bundle', ['compile'], function (done) {
  webpack({
    entry: {
      background: './.tmp/js/background.js',
      inject: './.tmp/js/inject.js'
    },
    output: {
      path: './app/js',
      filename: '[name].js'
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        output: {
          beautify: true
        },
        compress: false
      })
    ]
  }, done);
});

gulp.task('default', ['bundle']);

gulp.task('watch', function () {
  gulp.watch(['app/ts/**/*.ts'], ['bundle']);
});
