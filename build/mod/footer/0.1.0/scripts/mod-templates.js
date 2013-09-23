angular.module('mod/footer/views', ['mod/footer/views/footer.html']);

angular.module('mod/footer/views/footer.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('mod/footer/views/footer.html',
    '<div class="container narrow row-fluid">\n' +
    '    <div class="span4">\n' +
    '    </div>\n' +
    '    <div class="span3">\n' +
    '        <p>&copy; {{ footer.copyright }}</p>\n' +
    '    </div>\n' +
    '    <div class="span5">\n' +
    '        <ul class="footer-links">\n' +
    '            <li id="{{item.id}}" ng-repeat="item in footer.links">\n' +
    '                <a href="{{item.href}}">{{item.name}}</a>\n' +
    '            </li>\n' +
    '        </ul>\n' +
    '    </div>\n' +
    '</div>');
}]);
