var page = {
    url: "^", // root route
    views: {
        "navBar": {
            controller: "navigationCtrl",
            templateUrl: "mod/navigation/views/navigation.html"
        },
        "hero": {
            templateUrl: "app/index/views/hero.html"
        },
        "": {
            templateUrl: "app/index/views/content.html"
        },
        "footer": {
            templateUrl: "mod/footer/views/footer.html"
        }
    }
};

var app = angular.module('app',['markdownMod','navigationMod','ui.state']);
app.config( function($stateProvider){
    $stateProvider.state('page', page );
});