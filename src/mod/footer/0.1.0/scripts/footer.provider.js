angular.module('footerModProvider', ['coreMod'])
    .provider('footerMod', function (coreModProvider) {
        console.log('footerMod.provider');
        var config = coreModProvider.getConfig();
        this.template = null;
        this.copyright = config.footerMod.copyright;
        this.links = config.footerMod.links;
        this.setTemplate = function (template) {
            this.template = template;
        };
        this.getTemplate = function () {
            return this.template;
        };
        this.setCopyright = function (copyright){
            this.copyright = copyright;
        };
        this.getCopyright = function (){
            return this.copyright;
        };
        this.getLinks = function (){
            return this.links;
        };

        this.$get = function ($log) {
            $log.log('footerMod.provider.$get');
            var self = this;
            return {
                getTemplate: function () {
                    return self.template;
                },
                getCopyright: function () {
                    return self.copyright;
                },
                getLinks: function () {
                    return self.links;
                }
            };
        };
        this.$get.$inject = ['$log'];
    });

