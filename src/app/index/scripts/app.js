var page = {
    url: "/", // root route
    views: {
        "hero": {
            templateUrl: "app/index/views/hero.html"
        },
        "": {
            templateUrl: "app/index/views/content.html"
        }
    }
};

var indexApp = angular.module('indexApp',['appMod','ui.state']);
indexApp.config( function($stateProvider, $locationProvider){
    $stateProvider.state('index', page );
});
