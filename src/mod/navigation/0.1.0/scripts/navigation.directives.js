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

