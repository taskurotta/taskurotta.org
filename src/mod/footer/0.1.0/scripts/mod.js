var footerConfig = {
    template: 'mod/footer/0.1.0/views/footer.html',
    dropdown: true,
    items: [
        {id: "rootnav_index", href: "index.html", name: "Taskurotta" },
        {id: "rootnav_get_started", href: "get_started.html", name: "Введение" },
        {id: "rootnav_road_map", href: "road_map.html", name: "План"},
    ]
};

footerMod = angular.module('footerMod', []);
navigationMod.provider('$footerMod', function () {
    this.configParams = footerConfig;
    this.config = function (params) {
        this.configParams = params;
    }
    this.$get = function () {
        var params = this.configParams;
        return{
            config: function () {
                return params;
            }
        }
    };
});
navigationMod.directive('footer', function ($http,$footerMod) {
    var config = $footerMod.config();
    return {
        templateUrl: config.template,
        restrict: 'A',
        scope: false,
        link: function (scope, element, attrs) {

        }
    }

});

