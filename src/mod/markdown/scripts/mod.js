angular.module('markdownMod', []).
    provider('markdownProvider',function(){
        var src;
        this.source = source;
        function source(path) {
            if (path) src = path;
            return this;
        }
        this.getSource = getSource;
        function getSource() {
            if (path) src = path;
            return src;
        }
        this.$get = $get;
        function $get() {
            return
        }
    }).
    directive('markdown', function ($http,markdownProvider) {
        var converter = new Showdown.converter();

        function markup(text){
            var htmlText = converter.makeHtml(text);
            return htmlText;
        }

        function loadText(source){
            $http({ url: source,  method: "GET" })
                .success(function (text) {

                    element.html(markup(text));

                    // refresh affix spy function on nre DOM model
                    $('[data-spy="affix"]').each(function () {
                        $(this).affix('refresh')
                    });
                });
        }

        return {
            restrict: 'E',
            scope: {
                src: "@src"
            },
            link: function (scope, element, attrs) {

                var text = element.html();
                if(text)
                    element.html(markup(text));
                else if(attrs.src)
                    loadText(attrs.src)
                else if(markdownProvider.getSource())
                    loadText(markdownProvider.getSource())

                scope.$watch("src", function (value) {
                    if (attrs.src) {
                        loadText(attrs.src);
                    }
                });
            }
        };
    })