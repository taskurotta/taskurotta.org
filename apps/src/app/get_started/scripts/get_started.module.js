var getStartedApp = angular.module('get_started',
    ['coreMod','markdownMod','navigationMod','footerMod','app/get_started/views']);
getStartedApp.config( function($stateProvider,markdownModProvider){
    console.log('getStartedApp.config');
    var page = {
        url: '', //root route
        views: {
            'sideBar': {
                templateUrl: 'app/get_started/views/sidebar.html'
            },
            '': {
                templateUrl: 'app/get_started/views/content.html'
            }
        }
    };
//    var chapter = {
//        url: '/{chapter}', // root route
//        views: {
//            'sideBar': {
//                templateUrl: 'app/get_started/views/sidebar.html'
//            },
//            '': {
//                templateUrl: 'app/get_started/views/content.html'
//            }
//        }
//    };
    $stateProvider.state('get_started',page);
   // $stateProvider.state('get_started_cahpter',chapter);
    markdownModProvider.setSource('md/get_started.md');
});
