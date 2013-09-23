/**
 * taskurotta.org - v0.0.1 - 2013-09-23
 * 
 */
var coreMod = angular.module('coreMod', ['coreModProvider', 'ui.state'])
    .config(function (coreModProvider, $locationProvider) {
        console.log('coreMod.config');
    });

/*-------------*/
angular.module('coreModProvider', ['coreMod'])
    .constant('coreModConfig', appConfig)
    .provider('coreMod', function (coreModConfig) {
        console.log('coreMod.provider');
        this.config = coreModConfig; //config object
        console.log(this.config);
        this.getConfig = function () {
            return this.config;
        };
        this.getMod = function (name) {
            return this.config.mod[name];
        };
        this.$get = function ($log) {
//            $log.log('coreMod.provider.$get');
//            var self = this;
//            return {
//                getMod: function (name) {
//                    return self.config.mod[name];
//                }
//            };
        };
        this.$get.$inject = ['$log'];
    });