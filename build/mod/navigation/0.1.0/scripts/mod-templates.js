angular.module('mod/navigation/views', ['mod/navigation/views/navigation.html']);

angular.module('mod/navigation/views/navigation.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('mod/navigation/views/navigation.html',
    '    <div class="container">\n' +
    '        <button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">\n' +
    '            <span class="icon-bar"></span>\n' +
    '            <span class="icon-bar"></span>\n' +
    '            <span class="icon-bar"></span>\n' +
    '        </button>\n' +
    '        <div class="nav-collapse collapse">\n' +
    '            <ul class="nav navbar-nav">\n' +
    '                <li id="{{item.id}}" ng-repeat="item in menu.items" ng-class="{active: isActive(item), dropdown: hasChild(item)}">\n' +
    '                    <a href="{{item.href}}" ng-hide="hasChild(item)" ng-class="{active: isActive(item)}">{{item.name}}</a>\n' +
    '                    <a href="{{item.href}}" ng-show="hasChild(item)" ng-class="{active: isActive(item), \'dropdown-toggle\':true}" data-toggle="dropdown">{{item.name}}</a>\n' +
    '                    <ul class="dropdown-menu" ng-show="hasChild(item)">\n' +
    '                        <li id="{{child.id}}"><a href="{{child.href}}" ng-repeat="child in item.items">{{child.name}}</a></li>\n' +
    '                    </ul>\n' +
    '                </li>\n' +
    '            </ul>\n' +
    '        </div><!--/.nav-collapse -->\n' +
    '    </div>\n' +
    '\n' +
    '');
}]);
