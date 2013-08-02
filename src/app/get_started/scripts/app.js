var markdownParams = {
     src: "md/get_started.md"
};

var page_root = {
    url: "/{chapter}", // root route
    views: {
        "navBar": {
            templateUrl: "mod/navigation/0.1.0/views/navigation.html"
        },
        "sideBar": {
            templateUrl: "app/get_started/views/sidebar.html"
        },
        "": {
            templateUrl: "app/get_started/views/content.html"
        },
        "footer": {
            templateUrl: "mod/footer/0.1.0/views/footer.html"
        }
    }
};

var app = angular.module('app',['markdownMod','navigationMod','ui.state']);
app.config( function($stateProvider,$markdownModProvider,$locationProvider){
    $locationProvider.html5Mode(true);
    $stateProvider.state('get_started', page_root);
    $markdownModProvider.config(markdownParams);
});