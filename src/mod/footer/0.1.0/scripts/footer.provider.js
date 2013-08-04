footerMod.provider('$footerMod', function () {
    this.params = null;
    this.config = function (params) {
        this.params = params;
    };
    this.$get = function (footerModConfig) {
        var params = (this.params!==null)?this.params:footerModConfig;
        return {
            config: function () {
                return params;
            }
        };
    };
    this.$get.$inject = ['footerModConfig'];
});

