// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

// @angular-devkit/build-angular 0.9 spreads `req` into a plain object before handing it to
// webpack-dev-middleware; on Node >= 16 `headers` lives on the prototype and is lost, which
// crashes every asset request. Copy it onto the instance so the spread keeps it.
function ownHeadersMiddleware() {
  return function (req, res, next) {
    if (!Object.prototype.hasOwnProperty.call(req, 'headers')) {
      Object.defineProperty(req, 'headers', { value: req.headers, enumerable: true, writable: true });
    }
    next();
  };
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
      { 'middleware:own-headers': ['factory', ownHeadersMiddleware] }
    ],
    beforeMiddleware: ['own-headers'],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, './coverage/angular-hnpwa'),
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true,
      thresholds: {
        emitWarning: false,
        global: {
          statements: 80,
          lines: 80,
          branches: 80,
          functions: 80
        }
      }
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu']
      }
    },
    singleRun: false,
    restartOnFileChange: true
  });
};
