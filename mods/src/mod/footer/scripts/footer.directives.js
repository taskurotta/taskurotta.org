footerMod.directive('footer', function (footerMod,$log) {
    $log.info('footer.directive');
    return {
        templateUrl: footerMod.getTemplate(),
        restrict: 'A',
        scope: false,
        link: function (scope, element, attrs) {
            scope.footer = {
                copyright:footerMod.getCopyright(),
                links :footerMod.getLinks()};
        }
    };
});

