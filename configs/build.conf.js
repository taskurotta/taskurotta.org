/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {

  src: {
      dir :  'src',
      app :  'src/app',
      mod :  'src/mod',
      layouts :  'src/_layouts',
      includes :  'src/_includes',
      assets : 'src/assets',
      md : 'docs/md'
  },

  build:{
      dir: 'build',
      app :  'build/app',
      mod :  'build/mod',
      assets : 'build/assets',
      md : 'build/md'
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
