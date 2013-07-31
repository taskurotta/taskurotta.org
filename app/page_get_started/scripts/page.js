
var baseMod = angular.module('baseMod',['markdown','ui.state']);
baseMod.config( function($stateProvider){
    $stateProvider
        .state('page', {
            url: "^", // root route
            views: {
                "navBar": {
                    templateUrl: "base/views/navbar.html"
                },
                "sideBar": {
                    templateUrl: "page_get_started/views/sidebar.html"
                },
                "footer": {
                    templateUrl: "base/views/footer.html"
                }
//                "hint": {
//                    template: 'Главная страница портала!'
//                },
//                "": {
//                    templateUrl: "base/views/navbar.html"
//                },

            }
        });
//        .state('page.main', {
//            url: "^", // root route
//            views: {
//                "content": {
//                    templateUrl: "base/views/navbar.html"
//                },
//                "sideBar": {
//                    templateUrl: "base/views/navbar.html"
//                },
//                "hint@home": {
//                    template: "Стартовая страница!"
//                }
//
//            }
//        })
});