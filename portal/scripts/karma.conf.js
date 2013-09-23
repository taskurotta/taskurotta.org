// Karma configuration

// base path, that will be used to resolve files and exclude
basePath = 'build';

// list of files / patterns to load in the browser
files = [
    JASMINE,
    JASMINE_ADAPTER,
    'bower_components/angular/angular.js',
    'bower_components/angular-mocks/angular-mocks.js',
//    'vendor/angular-scenario/angular-scenario.js',
    'bower_components/angular-ui-router/release/angular-ui-router.js',
    'build/mod/*/*/scripts/mod.js',
    'build/mod/*/*/scripts/mod-templates.js',
    'build/mod/*/*/tests/mod-unit.js',
    'build/app/*/scripts/app.js',
    'build/app/*/scripts/app.js',
    'build/app/*/scripts/app-templates.js'
];

// list of files to exclude
exclude = [];

// test results reporter to use
// possible values: dots || progress || growl
reporters = ['progress'];

// web server port
port = 8080;

// cli runner port
runnerPort = 9100;

// enable / disable colors in the output (reporters and logs)
colors = true;

// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_DEBUG;

// enable / disable watching file and executing tests whenever any file changes
autoWatch = false;

// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['Chrome'];

// If browser does not capture in given timeout [ms], kill it
captureTimeout = 5000;

// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = true;
