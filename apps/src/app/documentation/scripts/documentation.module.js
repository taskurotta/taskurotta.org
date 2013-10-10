var roadMapApp = angular.module('app',
    ['coreMod', 'navigationMod', 'footerMod', 'markdownMod', 'app/documentation/views']);
roadMapApp.config(function ($stateProvider, markdownModProvider) {
    console.log('documentation.config');
    var page = {
        url: '', // root route
        views: {
            'sideBar': {
                templateUrl: 'app/documentation/views/sidebar.html'
            },
            '': {
                templateUrl: 'app/documentation/views/content.html'
            }
        }
    };
    $stateProvider.state('documentation', page);
    markdownModProvider.setSource('md/documentation/documentation.md');
});