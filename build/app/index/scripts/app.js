/**
 * taskurotta.org - v0.0.1 - 2013-09-23
 * 
 */
var indexApp = angular.module('app',
    ['coreMod','footerMod','navigationMod','app/index/views']);
indexApp.config( function($stateProvider){
    console.log('indexApp.config');
    var page = {
        url: '', // root route
        views: {
            'hero': {
                templateUrl: 'app/index/views/hero.html'
            },
            '': {
                templateUrl: 'app/index/views/content.html'
            }
        }
    };
    $stateProvider.state('index', page );
});
