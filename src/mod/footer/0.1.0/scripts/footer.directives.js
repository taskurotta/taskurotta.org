footerMod.directive('footer', function ($http,$footerMod) {
    var config = $footerMod.config();
    return {
        templateUrl: config.template,
        restrict: 'A',
        scope: false,
        link: function (scope, element, attrs) {
            scope.footer = {copyright:config.copyright, links :config.links};
        }
    };
});

