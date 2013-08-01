var app = angular.module('app',['markdownMod','navigationMod','ui.state']);

var src = "md/road_map.md";
var page = {
    url: "^", // root route
    views: {
        "navBar": {
            controller: "navigationCtrl",
            templateUrl: "mod/navigation/views/navigation.html"
        },
        "sideBar": {
            templateUrl: "app/road_map/views/sidebar.html"
        },
        "": {
            templateUrl: "app/road_map/views/content.html"
        },
        "footer": {
            templateUrl: "mod/footer/views/footer.html"
        }
    }
};

app.config( function($stateProvider,markdownProvider){
    $stateProvider.state("page",page);
    markdownProvider.source(src);
});