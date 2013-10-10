var roadMapApp = angular.module('app',
    ['coreMod', 'navigationMod', 'footerMod', 'markdownMod', 'app/documentation/views']);
roadMapApp.config(function ($stateProvider, markdownModProvider) {
    console.log('documentation.config');
    var page = {
        url: '', // root route
        views: {
            'sideBar': {
                templateUrl: 'app/documentation/views/sidebar.html'
            },
            '': {
                templateUrl: 'app/documentation/views/content.html',
                controller: function ($scope) {   //--Выносим сюда общие модели для дочерних блоков
                    markdownModProvider.setSource('md/documentation/intro.md');
                }
            }
        }
    };
    $stateProvider.state('documentation', page)
        .state('documentation_section', {
            url: '/{sectionId}', // root route
            views: {
                'sideBar': {
                    templateUrl: 'app/documentation/views/sidebar.html'
                },
                '': {
                    templateUrl: 'app/documentation/views/content.html',
                    controller: function ($scope, $stateParams) {   //--Выносим сюда общие модели для дочерних блоков
                        markdownModProvider.setSource('md/documentation/' + $stateParams.sectionId + '.md');
                    }
                }
            }
        });

});

