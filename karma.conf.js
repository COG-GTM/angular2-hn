// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-dev-shm-usage']
      }
    },
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
      {
        'middleware:ensure-headers': ['factory', function () {
          return function (req, res, next) {
            if (!req) {
              return next();
            }

            const headers = req.headers || {};
            // Ensure headers is an enumerable own property so the Angular CLI karma plugin's
            // spread/cloning of the request retains headers (req.headers.range is used by webpack-dev-middleware).
            if (!Object.prototype.propertyIsEnumerable.call(req, 'headers')) {
              Object.defineProperty(req, 'headers', {
                value: headers,
                enumerable: true,
                configurable: true,
                writable: true
              });
            } else if (!req.headers) {
              req.headers = headers;
            }

            return next();
          };
        }]
      }
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, './coverage/angular-hnpwa'),
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    middleware: ['ensure-headers'],
    browsers: ['ChromeHeadlessNoSandbox'],
    singleRun: false,
    restartOnFileChange: true
  });
};
