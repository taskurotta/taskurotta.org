angular.module('navigationMod', [])
    .value('$stateParams', {})
    .provider('navigation', function(){
        var navigation;
        var menu={}
        return navigation;
    })
    .controller('navigationCtrl', function ($scope) {
        $scope.navbar ={};
    });
