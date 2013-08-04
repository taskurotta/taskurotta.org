navigationMod.directive('navigation', function ($navigationMod) {
    var config = $navigationMod.config();
    return {
        restrict: 'A',
        templateUrl: config.template,
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
            scope.navigation = {menu: config.menu};
            scope.isActive = function (item) {
                return (item.href.substr(0, current.length) === current);
            };
        }
    };
});

