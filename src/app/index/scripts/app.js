var page = {
    url: "", // root route
    views: {
        "navBar": {
            templateUrl: "mod/navigation/0.1.0/views/navigation.html"
        },
        "hero": {
            templateUrl: "app/index/views/hero.html"
        },
        "": {
            templateUrl: "app/index/views/content.html"
        },
        "footer": {
            templateUrl: "mod/footer/0.1.0/views/footer.html"
        }
    }
};

var app = angular.module('app',['navigationMod','ui.state']);
app.config( function($stateProvider, $locationProvider){
   // $locationProvider.html5Mode(true);
    $stateProvider.state('index', page );
});
