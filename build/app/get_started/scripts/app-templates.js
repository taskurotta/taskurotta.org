angular.module('app/get_started/views', ['app/get_started/views/content.html', 'app/get_started/views/sidebar.html']);

angular.module('app/get_started/views/content.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('app/get_started/views/content.html',
    '<markdown autoscroll></markdown>');
}]);

angular.module('app/get_started/views/sidebar.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('app/get_started/views/sidebar.html',
    '<ul class="nav nav-list bs-docs-sidenav" data-spy="affix">\n' +
    '    <li><a href="#overview"><i class="icon-chevron-right"></i> Общее представление</a></li>\n' +
    '    <li><a href="#overview_deep"><i class="icon-chevron-right"></i> Чуть глубже</a></li>\n' +
    '    <li><a href="#maven-dep"><i class="icon-chevron-right"></i> Настройка Maven</a></li>\n' +
    '    <li><a href="#worker-new"><i class="icon-chevron-right"></i> Создание Исполнителя</a></li>\n' +
    '    <li><a href="#worker-client"><i class="icon-chevron-right"></i> Объявление способа взаимодействия</a>\n' +
    '    </li>\n' +
    '    <li><a href="#decider-new"><i class="icon-chevron-right"></i> Создание Координатора</a></li>\n' +
    '    <li><a href="#wf-bootstrap"><i class="icon-chevron-right"></i> Модуль запуска</a></li>\n' +
    '    <li><a href="#config"><i class="icon-chevron-right"></i> Настройка приложения</a></li>\n' +
    '    <li><a href="#fat-jar"><i class="icon-chevron-right"></i> Fat Jar</a></li>\n' +
    '    <li><a href="#run"><i class="icon-chevron-right"></i> Запуск</a></li>\n' +
    '</ul>');
}]);
