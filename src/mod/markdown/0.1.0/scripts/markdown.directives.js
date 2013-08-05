markdownMod.directive('markdown', function ($http,$markdownMod) {
        console.log('markdownMod.directive');
        var config = $markdownMod.config();
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
                    element.html($markdownMod.markup(element.html()));
                }
                else {
                    var src = attrs.src;
                    if(!src){ src = config.src;}
                    $markdownMod.load(src,reloadHtml);
                }

                scope.$watch('src', function (value) {
                    if (attrs.src) {
                        $markdownMod.load(attrs.src,reloadHtml);
                    }
                });
            }
        };
    });