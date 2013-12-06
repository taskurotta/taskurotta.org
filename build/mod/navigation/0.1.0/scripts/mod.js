/**
 * taskurotta.org - v0.0.1 - 2013-12-06
 * 
 */
var navigationMod = angular.module('navigationMod',
    ['navigationModProvider', 'mod/navigation/views']);
navigationMod.config(function (navigationModProvider) {
    console.log('navigationMod.config');
    navigationModProvider.setTemplate('mod/navigation/views/navigation.html');
});


/*-------------*/
navigationMod.directive('navigation', function (navigationMod,$log) {
    $log.info('navigation.directive');
    console.log(navigationMod.getTemplate());
    return {
        restrict: 'A',
        templateUrl: navigationMod.getTemplate(),
        controller: function () {

        },
        scope: false,
        link: function (scope, element, attrs) {
            function hasChild(item) {
                return ((item.items) && item.items.length > 0);
            }
            var current = attrs.navigation;
            scope.current = current;
            scope.hasChild = hasChild;
            scope.menu = navigationMod.getMenu();
            $log.log(scope.menu);
            scope.isActive = function (item) {
                return (item.href.substr(0, current.length) === current);
            };
        }
    };
});


/*-------------*/
angular.module('navigationModProvider', ['coreMod'])
    .provider('navigationMod', function (coreModProvider) {
        console.log('navigationMod.provider');
        var config = coreModProvider.getMod('navigation');
        this.template = null;
        this.menu = config.menu;
        this.setTemplate = function (template) {
            this.template = template;
        };
        this.getMenu = function () {
            return this.menu;
        };
        this.getTemplate = function () {
            return this.template;
        };
        this.$get = function ($log) {
            $log.log('navigationMod.provider.$get');
            $log.info(config);
            var self = this;
            return {
                getMenu: function () {
                    return self.menu;
                },
                getTemplate: function () {
                    return self.template;
                }
            };
        };
        this.$get.$inject = ['$log'];
    });
