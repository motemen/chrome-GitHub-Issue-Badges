var gulp    = require('gulp'),
    $       = require('gulp-load-plugins')()
    webpack = require('webpack');

var RE_GITHUB_ORIGIN = /^https:\/\/github\.com\b/;

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
    .pipe(gulp.dest('app/'));
});

gulp.task('compile', function () {
  return gulp.src('src/ts/**/*.ts')
    .pipe($.plumber())
    .pipe($.tsc({ noImplicitAny: true }))
    .pipe(gulp.dest('.tmp/js'));
});

gulp.task('bundle', ['compile', 'manifest'], function (done) {
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
  gulp.watch(['src/ts/**/*.ts'], ['bundle']);
});
