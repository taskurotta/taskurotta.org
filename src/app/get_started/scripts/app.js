var markdownParams = {
     src: "md/get_started.md"
};

var page = {
    url: "/{chapter}", // root route
    views: {
        "sideBar": {
            templateUrl: "app/get_started/views/sidebar.html"
        },
        "": {
            templateUrl: "app/get_started/views/content.html"
        }
    }
};

var get_startedApp = angular.module('get_startedApp',['appMod','ui.state','markdownMod']);
get_startedApp.config( function($stateProvider,$markdownModProvider,$locationProvider){
    $stateProvider.state("get_started",page);
    $markdownModProvider.config(markdownParams);
});