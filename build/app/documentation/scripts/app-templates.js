angular.module('app/documentation/views', ['app/documentation/views/content.html', 'app/documentation/views/sidebar.html']);

angular.module('app/documentation/views/content.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('app/documentation/views/content.html',
    '<markdown autoscroll></markdown>');
}]);

angular.module('app/documentation/views/sidebar.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('app/documentation/views/sidebar.html',
    '<ul class="nav nav-list bs-docs-sidenav">\n' +
    '    <li><a href="#intro"><i class="icon-chevron-right"></i> Введение</a></li>\n' +
    '    <li>\n' +
    '        <a href="#deployment_common"><i class="icon-chevron-down"></i> Варианты развертывания системы</a>\n' +
    '        <ul class="nav nav-list">\n' +
    '            <li><a href="#deployment_dev"><i class="icon-chevron-right"></i> Окружение разработчика</a></li>\n' +
    '            <li><a href="#deployment_memory"><i class="icon-chevron-right"></i> RESTfull-транспорт и хранилище в памяти</a></li>\n' +
    '            <li><a href="#deployment_hz"><i class="icon-chevron-right"></i> RESTfull-транспорт и хранилище в Hazelcast</a></li>\n' +
    '            <li><a href="#deployment_hz_mongo"><i class="icon-chevron-right"></i> RESTfull-транспорт и хранилище в Hazelcast и MongoDB</a></li>\n' +
    '            <li><a href="#deployment_hz_mongo_ora"><i class="icon-chevron-right"></i> RESTfull-транспорт и хранилище в Hazelcast, MongoDB и Oracle</a></li>\n' +
    '        </ul>\n' +
    '    </li>\n' +
    '\n' +
    '</ul>\n' +
    '');
}]);
