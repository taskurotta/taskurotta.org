angular.module('coreModProvider', ['coreMod'])
    .constant('coreModConfigFile', '/app/config.yml')
    .provider('coreMod', function (coreModConfigFile) {
        console.log('coreMod.provider');
        this.fileName = null; //config file name
        this.config = null; //config object
        this.loadYAML = function (fileName) {
            console.log('coreMod.provider.loadYAML:' + fileName);
            var configObject;
            $.ajax({
                url: fileName,
                async: false,
                success: function (data) {
                    console.log('loaded ' + fileName);
                    configObject = jsyaml.load(data);
                }
            });
            return configObject;
        };
        this.setConfigFile = function (fileName) {
            this.config = this.loadYAML(fileName);
            this.fileName = fileName;
        };
        this.getConfig = function () {
            return this.config;
        };
        this.$get = function ($log) {
            $log.log('coreMod.provider.$get');
            var self = this;
            return {
                getConfig: function () {
                    return self.config;
                }
            };
        };
        this.$get.$inject = ['$log'];
        this.setConfigFile(coreModConfigFile);
    });