var app = angular.module('app',['markdownMod','navigationMod','ui.state']);

var src = "md/get_started.md";
var page = {
    url: "^", // root route

    views: {
        "navBar": {
            controller: "navigationCtrl",
            templateUrl: "mod/navigation/views/navigation.html"
        },
        "sideBar": {
            templateUrl: "app/get_started/views/sidebar.html"
        },
        "": {
            controller: "bodyCtrl",
            templateUrl: "app/get_started/views/content.html"
        },
        "footer": {
            templateUrl: "mod/footer/views/footer.html"
        }
    }
};

app.config( function($stateProvider,markdownProvider){
    $stateProvider.state('page', page);
    markdownProvider.source(src);
});