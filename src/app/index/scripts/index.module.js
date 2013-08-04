var indexApp = angular.module('indexApp',
    ['appMod','ui.state','app/index/views']);
indexApp.config( function($stateProvider){
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
