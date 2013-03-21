angular.module('components', []).
    directive('markdown', function () {
        var converter = new Showdown.converter();
        return {
            restrict: 'E',
            scope: {},
            link: function(scope, element, attr) {
                var text = element.html();
//                alert(text);
                var htmlText = converter.makeHtml(text);
                element.html(htmlText);
            }
        };
    })