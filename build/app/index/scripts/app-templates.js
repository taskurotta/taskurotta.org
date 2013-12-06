angular.module('app/index/views', ['app/index/views/content.html', 'app/index/views/hero.html']);

angular.module('app/index/views/content.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('app/index/views/content.html',
    '<div>\n' +
    '    <p>\n' +
    '        Taskurotta uses <a href="http://www.hazelcast.com/">Hazelcast Framework</a> for creating shared memory and runtime environment between Taskurotta servers. This framework allows us to create transparent scalability.\n' +
    '        All nodes have auto-discovery feature which helps to register new node and distribute memory from one node to another.\n' +
    '    </p>\n' +
    '\n' +
    '    <p>\n' +
    '        Main features:\n' +
    '    <ul>\n' +
    '        <li>Dynamic process creation</li>\n' +
    '        <li>Simple run and control of processes</li>\n' +
    '        <li>Reusable Actors in processes(Workers and Coordinators)</li>\n' +
    '        <li>Regression tests based on actors and archive data</li>\n' +
    '        <li>Handy creation of actors</li>\n' +
    '        <li>Handy scalability of actors and servers</li>\n' +
    '        <li>Fault-tolerance and load-balancing</li>\n' +
    '        <li>Process Scheduler</li>\n' +
    '    </ul>\n' +
    '    </p>\n' +
    '</div>\n' +
    '');
}]);

angular.module('app/index/views/hero.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('app/index/views/hero.html',
    '<h1>Taskurotta</h1>\n' +
    '<p>Taskurotta - Distributed process runtime enviroment\n' +
    '</p>\n' +
    '<p><a href="road_map.html" class="btn btn-primary btn-large">More info &raquo;</a></p>');
}]);
