appMod.provider('$appMod', function () {
    this.params = null;
    this.config = function (params) {
        this.params = params;
    };
    this.$get = function (appModConfig) {
        var params = (this.params!==null)?this.params:appModConfig;
        return {
            config: function () {
                return params;
            }
        };
    };
    this.$get.$inject = ['appModConfig'];
});