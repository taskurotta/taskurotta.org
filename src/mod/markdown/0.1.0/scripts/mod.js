
var config = {};

angular.module('markdownMod', [])
    .provider('$markdownMod', function() {
        var converter = new Showdown.converter();
        this.params = config;
        this.config = function (params) {
            this.params = params
        };
        this.$get = $get;
        $get.$inject = ['$http'];
        function $get($http) {
            var params = this.params;
            return{
                config: function(){
                    return params;
                },
                markup: function (text){
                    return converter.makeHtml(text);
                },
                load: function (source,callback){
                    if(source){
                        $http({ url: source,  method: "GET" })
                            .success(function (text) {
                                callback(converter.makeHtml(text))
                            });
                    }
                }
            }
        };
    })
    .directive('markdown', function ($http,$markdownMod) {
        var config = $markdownMod.config();
        return {
            restrict: 'E',
            scope: {
                src: "@src"
            },
            link: function (scope, element, attrs) {
                if(element.html())
                    element.html($markdownMod.markup(element.html()));
                else{
                    var src = attrs.src
                    if(!src) src = config.src;
                    $markdownMod.load(src,reloadHtml);
                }

                scope.$watch("src", function (value) {
                    if (attrs.src) {
                        $markdownMod.load(attrs.src,reloadHtml);
                    }
                });

                function reloadHtml(html){
                    element.html(html);
                    // refresh affix spy function on nre DOM model
                    $('[data-spy="affix"]').each(function () {
                        $(this).affix('refresh')
                    });
                }
            }
        };
    })