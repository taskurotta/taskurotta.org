angular.module('app/index/views', ['app/index/views/content.html', 'app/index/views/hero.html']);

angular.module('app/index/views/content.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('app/index/views/content.html',
    '<div class="span4">\n' +
    '    <h2>Вышла пре-альфа</h2>\n' +
    '    <p>26 февраля вышла пре-альфа версия продукта. По случаю, добавлен план.</p>\n' +
    '    <p><a class="btn" href="road_map.html">План &raquo;</a></p>\n' +
    '</div>\n' +
    '<div class="span4">\n' +
    '    <h2>Первый запуск</h2>\n' +
    '    <p>14 февраля, в 18 часов 30 минут произведен старт ракетоносителя с Первым исскуственным спутником земли\n' +
    '        (ws-example). Спутник успешно облетел землю и вернулся на базу. Логи приборов показали штатный режим\n' +
    '        работы. Урааа! :)\n' +
    '    </p>\n' +
    '    <p><a class="btn" href="get_started.html">Введение &raquo;</a></p>\n' +
    '    <!--<p><a class="btn" href="#">View details &raquo;</a></p>-->\n' +
    '</div>\n' +
    '<div class="span4">\n' +
    '    <h2>Начаты работы</h2>\n' +
    '    <p>Жили-были и когда-то очень давно... SWF или откуда ноги растут.</p>\n' +
    '    <p><a class="btn" href="http://aws.amazon.com/swf/">SWF &raquo;</a></p>\n' +
    '</div>');
}]);

angular.module('app/index/views/hero.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('app/index/views/hero.html',
    '<h1>Taskurotta</h1>\n' +
    '<p>Cервис для построения масштабируемых приложений, реализующих процессы с асинхронным\n' +
    '    выполнением задач.</p>\n' +
    '<p><a href="get_started.html" class="btn btn-primary btn-large">Введение &raquo;</a></p>');
}]);
