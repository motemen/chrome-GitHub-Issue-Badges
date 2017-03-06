var gulp    = require('gulp'),
    $       = require('gulp-load-plugins')()
    webpack = require('webpack'),
    del     = require('del');

var RE_GITHUB_ORIGIN = /^https:\/\/github\.com\b/;

gulp.task('build', ['bundle', 'manifest', 'html']);

gulp.task('manifest', ['compile'], function () {
  var extensionConfig = require('./.tmp/js/config.js');

  function rewriteGitHubOrigin (url) {
    return url.replace(RE_GITHUB_ORIGIN, extensionConfig.githubOrigin);
  }

  return gulp.src('src/manifest.json')
    .pipe($.jsonEditor(function (manifest) {
      manifest.permissions = manifest.permissions.map(rewriteGitHubOrigin);

      manifest.content_scripts.forEach(function (contentScript) {
        contentScript.matches = contentScript.matches.map(rewriteGitHubOrigin);
      });

      return manifest;
    }))
    .pipe(gulp.dest('build/'));
});

gulp.task('html', function() {
  return gulp.src('src/html/*.html')
    .pipe(gulp.dest('build/html/'))
})

gulp.task('bundle', ['compile'], function (done) {
  webpack({
    entry: {
      background: './.tmp/js/background.js',
      inject: './.tmp/js/inject.js',
      options: './.tmp/js/options.js'
    },
    output: {
      path: './build/js',
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

gulp.task('compile', function () {
  return gulp.src('src/ts/**/*.ts')
    .pipe($.changed('.tmp/js', { extension: '.js' }))
    .pipe($.plumber())
    .pipe($.tsc({ noImplicitAny: true, target: 'ES6' }))
    .pipe(gulp.dest('.tmp/js'));
});

gulp.task('clean', del.bind(null, ['build/', '.tmp/']));

gulp.task('default', ['build']);

gulp.task('watch', function () {
  gulp.watch(['src/ts/**/*.ts'], ['bundle']);
});
