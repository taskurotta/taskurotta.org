/**
 * taskurotta.org - v0.0.1 - 2013-12-06
 * 
 */
markdownMod = angular.module('markdownMod', ['markdownModProvider']);
markdownMod.config(function(markdownModProvider){
    console.log('markdownMod.config');
    markdownModProvider.setBasePath('');
    markdownModProvider.setSource('md/index.md');
});
/*-------------*/
markdownMod.directive('markdown', function (markdownMod,$log) {
        $log.info('markdown.directive');
        return {
            restrict: 'E',
            scope: {
                src: '@src'
            },
            link: function (scope, element, attrs) {
                function reloadHtml(html){
                    element.html(html);
                    // refresh affix spy function on nre DOM model
                    $('[data-spy="affix"]').each(function () {
                        $(this).affix('refresh');
                    });
                }
                if(element.html()){
                    element.html(markdownMod.markup(element.html()));
                }
                else {
                    var src = attrs.src;
                    if(!src){ src = markdownMod.getSource();}
                    markdownMod.load(src,reloadHtml);
                }

                scope.$watch('src', function (value) {
                    if (attrs.src) {
                        markdownMod.load(attrs.src,reloadHtml);
                    }
                });
            }
        };
    });
/*-------------*/
angular.module('markdownModProvider', ['coreMod'])
    .provider('markdownMod', function () {
        console.log('markdownMod.provider');
        var converter = new Showdown.converter();
        this.path = '/';
        this.src = null;
        this.setBasePath = function (path) {
            this.params = path;
        };
        this.setSource = function (src) {
            this.src = src;
        };
        this.$get = function ($log, $http) {
            $log.log('markdownMod.provider.$get');
            var self = this;
            return {
                getBasePath: function () {
                    return self.path;
                },
                getSource: function () {
                    return self.src;
                },
                markup: function (text) {
                    return converter.makeHtml(text);
                },
                load: function (source, callback) {
                    if (source) {
                        $http({ url: source, method: 'GET' })
                            .success(function (text) {
                                $log.log('markdown file loaded');
                                callback(converter.makeHtml(text));
                            });
                    }
                }
            };
        };
        this.$get.$inject = ['$log', '$http'];
    });