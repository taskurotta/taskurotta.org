navigationMod.provider('$navigationMod',function () {
    this.params = null;
    this.config = function (params) {
        this.params = params;
    };
    this.$get = function (navigationModConfig) {
        var params = (this.params!==null)?this.params:navigationModConfig;
        return {
            config: function () {
                return params;
            }
        };
    };
    this.$get.$inject = ['navigationModConfig'];
});
