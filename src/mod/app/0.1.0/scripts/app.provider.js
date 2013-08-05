appMod.provider('$appMod', function () {
    var self = this;
    console.log('appMod.provider');
    this.params = null;
    this.config = function (params) {
        this.params = params;
    };
    this.$get = function (appModConfig) {
        console.log('appMod.provider.$get');
        if(self.params===null){
            self.params = appModConfig;
        }
        return {
            config: function () {
                return params;
            }
        };
    };
    this.$get.$inject = ['appModConfig'];
});