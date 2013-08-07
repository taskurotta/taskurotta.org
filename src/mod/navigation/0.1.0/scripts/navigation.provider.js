angular.module('navigationModProvider', ['coreMod'])
    .provider('navigationMod', function (coreModProvider) {
        console.log('navigationMod.provider');
        var config = coreModProvider.getConfig();
        this.template = null;
        this.menu = config.navigationMod.menu;
        this.setTemplate = function (template) {
            this.template = template;
        };
        this.getMenu = function () {
            return this.menu;
        };
        this.getTemplate = function () {
            return this.template;
        };
        this.$get = function ($log) {
            $log.log('navigationMod.provider.$get');
            var self = this;
            return {
                getMenu: function () {
                    return self.menu;
                },
                getTemplate: function () {
                    return self.template;
                }
            };
        };
        this.$get.$inject = ['$log'];
    });
