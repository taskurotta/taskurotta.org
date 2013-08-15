var indexApp = angular.module('index',
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
