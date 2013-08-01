angular.module('markdownMod', []).
    directive('markdown', function ($http) {
        var converter = new Showdown.converter();
        return {
            restrict: 'E',
            scope: {
                src: "@src"
            },
            link: function (scope, element, attrs) {
                var text = element.html();
                var htmlText = converter.makeHtml(text);
                element.html(htmlText);

                scope.$watch("src", function (value) {

                    if (attrs.src) {

                        $http({
                            url: attrs.src,
                            method: "GET"
                        }).success(function (text) {
                                var htmlText = converter.makeHtml(text);
                                element.html(htmlText);

                                // refresh affix spy function on nre DOM model
                                $('[data-spy="affix"]').each(function () {
                                    $(this).affix('refresh')
                                });
                            });

                    }
                });
            }
        };
    })