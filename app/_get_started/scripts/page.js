var page = {
    url: "^", // root route
    views: {
        "navBar": {
            controller: "navigationCtrl",
            templateUrl: "mod_navigation/views/navigation.html"
        },
        "sideBar": {
            templateUrl: "_get_started/views/sidebar.html"
        },
        "": {
            templateUrl: "_get_started/views/content.html"
        },
        "footer": {
            templateUrl: "mod_footer/views/footer.html"
        }
    }
};

var app = angular.module('app',['markdownMod','navigationMod','ui.state']);
app.config( function($stateProvider){
    $stateProvider.state('page', page);
});