angular.module('navigationModProvider', ['coreMod'])
    .provider('navigationMod', function (coreModProvider) {
        console.log('navigationMod.provider');
        var config = coreModProvider.getRef('navigationMod');
        this.template = null;
        this.menu = config.menu;
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
            $log.info(config);
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
