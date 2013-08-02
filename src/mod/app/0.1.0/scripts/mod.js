var appMod = angular.module('appMod', ['navigationMod','footerMod']);

appConfig = {}

appMod.config( function($locationProvider){
    $locationProvider.html5Mode(true);
});
appMod.provider('$appnMod', function () {
    this.configParams = appConfig;
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
})