var markdownParams = {
    src: "md/road_map.md"
};

var page = {
    url: "/{chapter}", // root route
    views: {
        "navBar": {
            templateUrl: "mod/navigation/0.1.0/views/navigation.html"
        },
        "sideBar": {
            templateUrl: "app/road_map/views/sidebar.html"
        },
        "": {
            templateUrl: "app/road_map/views/content.html"
        },
        "footer": {
            templateUrl: "mod/footer/0.1.0/views/footer.html"
        }
    }
};

var app = angular.module('app',['markdownMod','navigationMod','ui.state']);
app.config( function($stateProvider,$markdownModProvider,$locationProvider){
    $locationProvider.html5Mode(true);
    $stateProvider.state("road_map",page);
    $markdownModProvider.config(markdownParams);
});