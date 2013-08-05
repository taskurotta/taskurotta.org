/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {

  src: {
      dir :  'src',
      app :  '<%= src.dir %>/app',
      mod :  '<%= src.dir %>/mod',
      layouts :  '<%= src.dir %>/_layouts',
      includes :  '<%= src.dir %>/_includes',
      assets : '<%= src.dir %>/assets',
      md : '<%= src.dir %>/md'
  },

  build:{
      dir: 'build',
      app :  '<%= build.dir %>/app',
      mod :  '<%= build.dir %>/mod',
      assets : '<%= build.dir %>/assets',
      md : '<%= build.dir %>/md'
  },


  file: {
      scripts: 'scripts/{,*/}*.js',
      tests: 'tests/{,*/}*.js',
      units: 'tests/unit/{,*/}*.js',
      e2e: 'tests/e2e/{,*/}*.js',
      views: 'views/**/*.html',

      app: {
          script: 'scripts/app.js',
          templates: 'scripts/app-templates.js',
          unit: 'tests/app-unit.spec.js',
          e2e: 'tests/app-e2e.spec.js'

      },
      mod: {
          script: 'scripts/mod.js',
          templates:'scripts/mod-templates.js',
          unit:'tests/mod-unit.spec.js',
          e2e:'tests/mod-e2e.spec.js'

      }
  }

//  vendor_files: {
//    js: [
//      'vendor/angular/angular.js',
//      'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
//      'vendor/placeholders/angular-placeholders-0.0.1-SNAPSHOT.min.js',
//      'vendor/angular-ui-router/release/angular-ui-router.js',
//      'vendor/angular-ui-utils/modules/route/route.js'
//    ],
//    css: [
//    ]
//  }
};
