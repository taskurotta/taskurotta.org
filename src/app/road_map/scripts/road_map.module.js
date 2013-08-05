var roadMapApp = angular.module('road_mapApp',['appMod','markdownMod','app/road_map/views']);
roadMapApp.config( function($stateProvider,$markdownModProvider){
    console.log('roadMapApp.config');
    var markdownParams = {
        src: 'md/road_map.md'
    };

    var page = {
        url: '', // root route
        views: {
            'sideBar': {
                templateUrl: 'app/road_map/views/sidebar.html'
            },
            '': {
                templateUrl: 'app/road_map/views/content.html'
            }
        }
    };
    var chapter = {
        url: '/{chapter}', // root route
        views: {
            'sideBar': {
                templateUrl: 'app/road_map/views/sidebar.html'
            },
            '': {
                templateUrl: 'app/road_map/views/content.html'
            }
        }
    };
    $stateProvider.state('road_map',page);
   // $stateProvider.state('road_map_cahpter',chapter);
    $markdownModProvider.config(markdownParams);
});