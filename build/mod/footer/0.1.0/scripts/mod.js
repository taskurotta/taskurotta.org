/**
 * taskurotta.org - v0.0.1 - 2013-09-23
 * 
 */
var footerMod = angular.module('footerMod',
    ['footerModProvider', 'mod/footer/views']);
footerMod.config(function (footerModProvider) {
    console.log('footerMod.config');
    footerModProvider.setTemplate('mod/footer/views/footer.html');
    //footerModProvider.setCopyright('@Taskurotta Team 2013');
});


/*-------------*/
footerMod.directive('footer', function (footerMod,$log) {
    $log.info('footer.directive');
    return {
        templateUrl: footerMod.getTemplate(),
        restrict: 'A',
        scope: false,
        link: function (scope, element, attrs) {
            scope.footer = {
                copyright:footerMod.getCopyright(),
                links :footerMod.getLinks()};
        }
    };
});


/*-------------*/
angular.module('footerModProvider', ['coreMod'])
    .provider('footerMod', function (coreModProvider) {
        console.log('footerMod.provider');
        var config = coreModProvider.getMod('footer');
        this.template = null;
        this.copyright = config.copyright;
        this.links = config.links;
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

