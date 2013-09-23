angular.module('app/road_map/views', ['app/road_map/views/content.html', 'app/road_map/views/sidebar.html']);

angular.module('app/road_map/views/content.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('app/road_map/views/content.html',
    '<markdown autoscroll></markdown>');
}]);

angular.module('app/road_map/views/sidebar.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('app/road_map/views/sidebar.html',
    '<ul class="nav nav-list bs-docs-sidenav" data-spy="affix">\n' +
    '    <li><a href="#pre-alfa"><i class="icon-chevron-right"></i> Пре-альфа (февраль)</a></li>\n' +
    '    <li><a href="#alfa"><i class="icon-chevron-right"></i> Альфа (март)</a></li>\n' +
    '    <li><a href="#beta"><i class="icon-chevron-right"></i> Бета (апрель)</a></li>\n' +
    '    <li><a href="#pre-release"><i class="icon-chevron-right"></i> Релиз-кандидат (май)</a></li>\n' +
    '    <li><a href="#release"><i class="icon-chevron-right"></i> Релиз (июнь)</a></li>\n' +
    '</ul>\n' +
    '');
}]);
