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