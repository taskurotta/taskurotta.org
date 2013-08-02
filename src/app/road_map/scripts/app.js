var markdownParams = {
    src: "md/road_map.md"
};

var page = {
    url: "/{chapter}", // root route
    views: {
        "sideBar": {
            templateUrl: "app/road_map/views/sidebar.html"
        },
        "": {
            templateUrl: "app/road_map/views/content.html"
        }
    }
};

var road_mapApp = angular.module('road_mapApp',['appMod','ui.state','markdownMod']);
road_mapApp.config( function($stateProvider,$markdownModProvider,$locationProvider){
    $stateProvider.state("road_map",page);
    $markdownModProvider.config(markdownParams);
});